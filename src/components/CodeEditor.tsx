import { useState, useEffect, useRef } from 'react';
import { Play, Save, RotateCcw, FileCode, X, Columns, LayoutGrid, ExternalLink, Maximize2, Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

type FileType = 'html' | 'css' | 'js';

interface FileItem {
  id: FileType;
  name: string;
  language: string;
  icon: string;
}

interface ConsoleMessage {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

interface CodeEditorProps {
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  onSave?: (html: string, css: string, js: string) => void;
  onReset?: () => void;
  autoRun?: boolean;
}

const files: FileItem[] = [
  { id: 'html', name: 'index.html', language: 'html', icon: '📄' },
  { id: 'css', name: 'styles.css', language: 'css', icon: '🎨' },
  { id: 'js', name: 'script.js', language: 'javascript', icon: '⚡' },
];

export default function CodeEditor({
  initialHtml = '',
  initialCss = '',
  initialJs = '',
  onSave,
  onReset,
  autoRun = true
}: CodeEditorProps) {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [openFiles, setOpenFiles] = useState<FileType[]>(['html']);
  const [activeFile, setActiveFile] = useState<FileType>('html');
  const [layout, setLayout] = useState<'single' | 'split' | 'grid'>('single');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewWidth, setPreviewWidth] = useState(33);
  const [isResizing, setIsResizing] = useState(false);
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const externalWindowRef = useRef<Window | null>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHtml(initialHtml);
    setCss(initialCss);
    setJs(initialJs);
  }, [initialHtml, initialCss, initialJs]);

  useEffect(() => {
    if (autoRun) {
      runCode();
    }
  }, [html, css, js, autoRun, isPoppedOut]);

  const addConsoleMessage = (type: ConsoleMessage['type'], message: string) => {
    setConsoleMessages(prev => [...prev, {
      id: messageIdCounter,
      type,
      message,
      timestamp: new Date()
    }]);
    setMessageIdCounter(prev => prev + 1);
  };

  const runCode = () => {
    setConsoleMessages([]);
    setMessageIdCounter(0);

    const consoleInterceptor = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          const originalInfo = console.info;

          console.log = function(...args) {
            window.parent.postMessage({ type: 'console', level: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }, '*');
            originalLog.apply(console, args);
          };

          console.error = function(...args) {
            window.parent.postMessage({ type: 'console', level: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }, '*');
            originalError.apply(console, args);
          };

          console.warn = function(...args) {
            window.parent.postMessage({ type: 'console', level: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }, '*');
            originalWarn.apply(console, args);
          };

          console.info = function(...args) {
            window.parent.postMessage({ type: 'console', level: 'info', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }, '*');
            originalInfo.apply(console, args);
          };

          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({ type: 'console', level: 'error', message: String(message) + ' (Line ' + lineno + ')' }, '*');
            return false;
          };
        })();
      </script>
    `;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
          ${consoleInterceptor}
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch (error) {
              console.error('JavaScript Error:', error.message);
              document.body.innerHTML += '<div style="color: red; padding: 10px; border: 1px solid red; margin: 10px; background: #ffeeee;">Error: ' + error.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;

    const iframe = iframeRef.current;
    if (iframe && !isPoppedOut) {
      const document = iframe.contentDocument;
      if (document) {
        document.open();
        document.write(content);
        document.close();
      }
    }

    if (isPoppedOut && externalWindowRef.current && !externalWindowRef.current.closed) {
      const externalDoc = externalWindowRef.current.document;
      externalDoc.open();
      externalDoc.write(content);
      externalDoc.close();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(html, css, js);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setHtml(initialHtml);
      setCss(initialCss);
      setJs(initialJs);
    }
  };

  const openFile = (fileId: FileType) => {
    if (!openFiles.includes(fileId)) {
      setOpenFiles([...openFiles, fileId]);
    }
    setActiveFile(fileId);
  };

  const closeFile = (fileId: FileType, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f !== fileId);
    if (newOpenFiles.length === 0) {
      newOpenFiles.push('html');
    }
    setOpenFiles(newOpenFiles);
    if (activeFile === fileId) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
    }
  };

  const getFileContent = (fileId: FileType) => {
    switch (fileId) {
      case 'html': return html;
      case 'css': return css;
      case 'js': return js;
    }
  };

  const setFileContent = (fileId: FileType, value: string) => {
    switch (fileId) {
      case 'html': setHtml(value); break;
      case 'css': setCss(value); break;
      case 'js': setJs(value); break;
    }
  };

  const renderEditor = (fileId: FileType, height: string = "100%") => {
    const file = files.find(f => f.id === fileId);
    if (!file) return null;

    return (
      <div className="flex flex-col h-full">
        <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex items-center gap-2">
          <span className="text-lg">{file.icon}</span>
          <span className="text-slate-300 text-sm font-medium">{file.name}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor
            height={height}
            defaultLanguage={file.language}
            value={getFileContent(fileId)}
            onChange={(value) => setFileContent(fileId, value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true
              },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              wordBasedSuggestions: 'matchingDocuments',
              suggest: {
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showSnippets: true,
              },
              parameterHints: {
                enabled: true,
                cycle: true
              },
              snippetSuggestions: 'top',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoIndent: 'full',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </div>
    );
  };

  const popOutPreview = () => {
    const width = 800;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const externalWindow = window.open(
      '',
      'Preview',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (externalWindow) {
      externalWindowRef.current = externalWindow;
      setIsPoppedOut(true);

      externalWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Preview - Live</title>
            <style>
              body { margin: 0; padding: 0; }
            </style>
          </head>
          <body></body>
        </html>
      `);

      const checkClosed = setInterval(() => {
        if (externalWindow.closed) {
          clearInterval(checkClosed);
          setIsPoppedOut(false);
          externalWindowRef.current = null;
        }
      }, 500);

      runCode();
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const container = resizeRef.current?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;

      if (newWidth >= 15 && newWidth <= 70) {
        setPreviewWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        addConsoleMessage(event.data.level, event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [messageIdCounter]);

  useEffect(() => {
    return () => {
      if (externalWindowRef.current && !externalWindowRef.current.closed) {
        externalWindowRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
            title="Toggle sidebar"
          >
            <FileCode className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-700" />

          <div className="flex gap-1">
            <button
              onClick={() => setLayout('single')}
              className={`p-2 rounded transition ${
                layout === 'single'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Single editor"
            >
              <div className="w-4 h-4 border-2 border-current rounded" />
            </button>
            <button
              onClick={() => setLayout('split')}
              className={`p-2 rounded transition ${
                layout === 'split'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Split view"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded transition ${
                layout === 'grid'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {onReset && (
            <button
              onClick={handleReset}
              className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
              title="Reset to original"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          {!autoRun && (
            <button
              onClick={runCode}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
          )}
          {onSave && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer Sidebar */}
        {sidebarOpen && (
          <div className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-700">
              <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Files</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => openFile(file.id)}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition ${
                    activeFile === file.id
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-lg">{file.icon}</span>
                  <span className="text-sm font-medium">{file.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center bg-slate-800 border-b border-slate-700 overflow-x-auto">
            {openFiles.map(fileId => {
              const file = files.find(f => f.id === fileId);
              if (!file) return null;
              return (
                <button
                  key={fileId}
                  onClick={() => setActiveFile(fileId)}
                  className={`flex items-center gap-2 px-4 py-2 border-r border-slate-700 transition ${
                    activeFile === fileId
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{file.icon}</span>
                  <span className="text-sm">{file.name}</span>
                  <button
                    onClick={(e) => closeFile(fileId, e)}
                    className="ml-1 hover:bg-slate-700 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              );
            })}
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            {layout === 'single' && (
              <div className="flex-1 border-r border-slate-700">
                {renderEditor(activeFile)}
              </div>
            )}

            {layout === 'split' && (
              <>
                <div className="flex-1 border-r border-slate-700">
                  {renderEditor(openFiles[0] || 'html')}
                </div>
                {openFiles[1] && (
                  <div className="flex-1 border-r border-slate-700">
                    {renderEditor(openFiles[1])}
                  </div>
                )}
              </>
            )}

            {layout === 'grid' && (
              <div className="flex-1 grid grid-rows-2 border-r border-slate-700">
                <div className="border-b border-slate-700">
                  {renderEditor('html')}
                </div>
                <div className="grid grid-cols-2">
                  <div className="border-r border-slate-700">
                    {renderEditor('css')}
                  </div>
                  <div>
                    {renderEditor('js')}
                  </div>
                </div>
              </div>
            )}

            {/* Resize Handle */}
            {!isPoppedOut && (
              <div
                ref={resizeRef}
                onMouseDown={handleResizeStart}
                className={`w-1 bg-slate-700 hover:bg-blue-500 cursor-col-resize transition-colors ${
                  isResizing ? 'bg-blue-500' : ''
                }`}
                title="Drag to resize"
              />
            )}

            {/* Preview Panel */}
            {!isPoppedOut && (
              <div
                className="flex flex-col bg-white"
                style={{ width: `${previewWidth}%` }}
              >
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-slate-300 font-medium text-sm">Preview</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewWidth(previewWidth === 50 ? 33 : 50)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                      title="Toggle preview size"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={popOutPreview}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                      title="Pop out preview"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <iframe
                  ref={iframeRef}
                  className="flex-1 w-full h-full bg-white"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}

            {/* Preview Popped Out Message */}
            {isPoppedOut && (
              <div className="flex-1 flex items-center justify-center bg-slate-800 text-slate-400">
                <div className="text-center">
                  <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">Preview in External Window</p>
                  <p className="text-sm mt-1">Updates live as you code</p>
                  <button
                    onClick={() => {
                      if (externalWindowRef.current) {
                        externalWindowRef.current.close();
                      }
                      setIsPoppedOut(false);
                    }}
                    className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                  >
                    Close External Window
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Panel */}
          {terminalOpen && (
            <div
              ref={terminalRef}
              className="border-t border-slate-700 bg-slate-900 flex flex-col"
              style={{ height: `${terminalHeight}px` }}
            >
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 font-medium text-sm">Console</span>
                  <span className="text-xs text-slate-500">({consoleMessages.length} messages)</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConsoleMessages([])}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                    title="Clear console"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTerminalOpen(false)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                    title="Close console"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-sm">
                {consoleMessages.length === 0 ? (
                  <div className="text-slate-500 italic text-center py-4">
                    Console is empty. Run your code to see output.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {consoleMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 py-1 px-2 rounded ${
                          msg.type === 'error' ? 'bg-red-900/20 text-red-300' :
                          msg.type === 'warn' ? 'bg-yellow-900/20 text-yellow-300' :
                          msg.type === 'info' ? 'bg-blue-900/20 text-blue-300' :
                          'text-slate-300'
                        }`}
                      >
                        <span className={`flex-shrink-0 font-bold ${
                          msg.type === 'error' ? 'text-red-400' :
                          msg.type === 'warn' ? 'text-yellow-400' :
                          msg.type === 'info' ? 'text-blue-400' :
                          'text-green-400'
                        }`}>
                          {msg.type === 'error' ? '❌' :
                           msg.type === 'warn' ? '⚠️' :
                           msg.type === 'info' ? 'ℹ️' :
                           '▸'}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap break-all">{msg.message}</span>
                        <span className="flex-shrink-0 text-xs text-slate-500">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Toggle Button (when closed) */}
      {!terminalOpen && (
        <div className="border-t border-slate-700 bg-slate-800">
          <button
            onClick={() => setTerminalOpen(true)}
            className="w-full px-4 py-2 flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-medium">Show Console</span>
            <ChevronUp className="w-4 h-4 ml-auto" />
          </button>
        </div>
      )}
    </div>
  );
}
