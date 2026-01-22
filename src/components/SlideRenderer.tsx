import { Slide } from '../data/slides';
import { Globe, Server, Monitor, Wifi } from 'lucide-react';

interface SlideRendererProps {
  slide: Slide;
}

export default function SlideRenderer({ slide }: SlideRendererProps) {
  switch (slide.type) {
    case 'title':
      return (
        <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-16">
          <div className="text-center max-w-4xl">
            <h1 className="text-6xl font-bold mb-4">{slide.title}</h1>
            {slide.subtitle && (
              <h2 className="text-3xl text-slate-300 mb-12">{slide.subtitle}</h2>
            )}
            {slide.content && (
              <div className="text-xl text-slate-400 whitespace-pre-line leading-relaxed">
                {slide.content}
              </div>
            )}
          </div>
        </div>
      );

    case 'section':
      return (
        <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white p-16">
          <div className="text-center">
            {slide.subtitle && (
              <div className="text-2xl text-blue-200 mb-6 uppercase tracking-wider">
                {slide.subtitle}
              </div>
            )}
            <h1 className="text-7xl font-bold">{slide.title}</h1>
          </div>
        </div>
      );

    case 'content':
      return (
        <div className="h-full flex flex-col bg-white p-16">
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-slate-900 mb-2">{slide.title}</h2>
            {slide.subtitle && (
              <p className="text-2xl text-slate-600">{slide.subtitle}</p>
            )}
          </div>
          {slide.content && (
            <div className="text-2xl text-slate-700 leading-relaxed whitespace-pre-line">
              {slide.content}
            </div>
          )}
          {slide.items && (
            <ul className="space-y-4 mt-8">
              {slide.items.map((item, index) => (
                <li key={index} className="text-2xl text-slate-700 flex items-start">
                  <span className="text-blue-600 mr-4 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'timeline':
      return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 p-16">
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Globe className="w-12 h-12 text-blue-600" />
                <h3 className="text-3xl font-semibold text-slate-600">Question</h3>
              </div>
              <p className="text-4xl text-slate-900 mb-12">{slide.question}</p>
            </div>

            <div className="bg-blue-600 text-white p-8 rounded-2xl mb-8">
              <h4 className="text-2xl mb-4 text-blue-100">Answer</h4>
              <p className="text-5xl font-bold mb-6">{slide.answer}</p>
              {slide.content && (
                <p className="text-xl text-blue-100 leading-relaxed">{slide.content}</p>
              )}
              {slide.link && (
                <a href={slide.link} target="_blank" rel="noopener noreferrer"
                   className="inline-block mt-4 text-blue-200 hover:text-white underline text-lg">
                  {slide.link}
                </a>
              )}
            </div>
          </div>
        </div>
      );

    case 'definition':
      return (
        <div className="h-full flex flex-col bg-white p-16">
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              {slide.title.toLowerCase().includes('server') && <Server className="w-16 h-16 text-green-600" />}
              {slide.title.toLowerCase().includes('client') && <Monitor className="w-16 h-16 text-blue-600" />}
              {(slide.title.toLowerCase().includes('front') || slide.title.toLowerCase().includes('back')) &&
                <Wifi className="w-16 h-16 text-purple-600" />}
              <h2 className="text-6xl font-bold text-slate-900">{slide.title}</h2>
            </div>
            {slide.subtitle && (
              <p className="text-3xl text-slate-600 mb-6">{slide.subtitle}</p>
            )}
            <p className="text-3xl text-slate-700 leading-relaxed whitespace-pre-line">
              {slide.content}
            </p>
          </div>
        </div>
      );

    default:
      return <div>Unknown slide type</div>;
  }
}
