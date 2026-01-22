import { useState } from 'react';
import { X, SplitSquareHorizontal, ListEnd } from 'lucide-react';

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

interface CodeDiffViewerProps {
  oldCode: string;
  newCode: string;
  language: 'html' | 'css' | 'js';
  onClose: () => void;
}

export default function CodeDiffViewer({ oldCode, newCode, language, onClose }: CodeDiffViewerProps) {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const computeDiff = (): DiffLine[] => {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    const diff: DiffLine[] = [];

    const maxLength = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === newLine) {
        diff.push({
          type: 'context',
          content: oldLine || '',
          oldLineNum: i + 1,
          newLineNum: i + 1
        });
      } else {
        if (oldLine !== undefined) {
          diff.push({
            type: 'remove',
            content: oldLine,
            oldLineNum: i + 1
          });
        }
        if (newLine !== undefined) {
          diff.push({
            type: 'add',
            content: newLine,
            newLineNum: i + 1
          });
        }
      }
    }

    return diff;
  };

  const diffLines = computeDiff();

  const getLanguageLabel = () => {
    switch (language) {
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'js': return 'JavaScript';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Code Comparison</h2>
            <p className="text-slate-600 text-sm">{getLanguageLabel()} Changes</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  viewMode === 'split'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SplitSquareHorizontal className="w-4 h-4" />
                Split
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  viewMode === 'unified'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListEnd className="w-4 h-4" />
                Unified
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-2">
              <div className="border-r-2 border-slate-200">
                <div className="sticky top-0 bg-red-50 border-b-2 border-red-200 px-4 py-2">
                  <span className="font-semibold text-red-900">Original</span>
                </div>
                <div className="font-mono text-sm">
                  {diffLines
                    .filter(line => line.type !== 'add')
                    .map((line, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          line.type === 'remove'
                            ? 'bg-red-100'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-12 flex-shrink-0 text-right px-2 py-1 text-slate-400 select-none border-r border-slate-200">
                          {line.oldLineNum}
                        </div>
                        <div className="flex-1 px-4 py-1 overflow-x-auto">
                          <pre className="inline">{line.content || ' '}</pre>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <div className="sticky top-0 bg-green-50 border-b-2 border-green-200 px-4 py-2">
                  <span className="font-semibold text-green-900">Modified</span>
                </div>
                <div className="font-mono text-sm">
                  {diffLines
                    .filter(line => line.type !== 'remove')
                    .map((line, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          line.type === 'add'
                            ? 'bg-green-100'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-12 flex-shrink-0 text-right px-2 py-1 text-slate-400 select-none border-r border-slate-200">
                          {line.newLineNum}
                        </div>
                        <div className="flex-1 px-4 py-1 overflow-x-auto">
                          <pre className="inline">{line.content || ' '}</pre>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="font-mono text-sm">
              {diffLines.map((line, index) => (
                <div
                  key={index}
                  className={`flex ${
                    line.type === 'add'
                      ? 'bg-green-100'
                      : line.type === 'remove'
                      ? 'bg-red-100'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 flex-shrink-0 text-right px-2 py-1 text-slate-400 select-none border-r border-slate-200">
                    {line.oldLineNum || line.newLineNum}
                  </div>
                  <div className="w-8 flex-shrink-0 text-center px-2 py-1 text-slate-600 select-none border-r border-slate-200">
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                  </div>
                  <div className="flex-1 px-4 py-1 overflow-x-auto">
                    <pre className="inline">{line.content || ' '}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t-2 border-slate-200 bg-slate-50">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
              <span className="text-slate-600">Added</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
              <span className="text-slate-600">Removed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-slate-300 rounded"></div>
              <span className="text-slate-600">Unchanged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
