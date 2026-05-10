import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Loader2, Image as ImageIcon, MessageSquare, Sparkles, Zap, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService, Message } from './services/geminiService';
import { cn } from './lib/utils';

type View = 'chat' | 'image';

export default function App() {
  const [view, setView] = useState<View>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{url: string, prompt: string}[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const newUserMessage: Message = { role: 'user', parts: [{ text: userMessage }] };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await geminiService.chat(messages, userMessage);
      const modelMessage: Message = { role: 'model', parts: [{ text: response || "" }] };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I encountered an error processing your request. Please check your API key." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    try {
      const enhancedPrompt = await geminiService.generateImagePrompt(imagePrompt);
      const imageUrl = await geminiService.generateImage(enhancedPrompt || imagePrompt);
      setGeneratedImages(prev => [{ url: imageUrl, prompt: imagePrompt }, ...prev]);
      setImagePrompt('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="flex h-screen bg-aether-bg text-aether-text font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex flex-col bg-aether-panel border-r border-white/5 shrink-0 hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-full blur-[2px]"></div>
          </div>
          <span className="font-semibold tracking-tight text-white uppercase text-sm">Aetheris AI</span>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 px-3 py-2 mt-4 mb-2 font-bold">Intelligence Hub</div>
          <button 
            onClick={() => setView('chat')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
              view === 'chat' ? "bg-white/5 text-white border border-white/10" : "text-gray-400 hover:bg-white/5"
            )}
          >
            <span className="opacity-70">{view === 'chat' ? '◆' : '◇'}</span> Advanced Reasoning
          </button>
          <button 
            onClick={() => setView('image')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
              view === 'image' ? "bg-white/5 text-white border border-white/10" : "text-gray-400 hover:bg-white/5"
            )}
          >
            <span className="opacity-70">{view === 'image' ? '◆' : '◇'}</span> Creative Studio
          </button>
        </nav>

        <div className="p-4">
          <div className="bg-aether-accent/10 border border-aether-accent/20 rounded-xl p-4">
            <p className="text-xs text-indigo-300 font-medium mb-1">Neural Core Active</p>
            <p className="text-[10px] text-indigo-300/60 leading-tight">Gemini 3 Flash instance enabled for high-fidelity synthesis.</p>
          </div>
          <button 
            onClick={() => setMessages([])}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-[10px] uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Reset State
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-aether-header shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400 font-mono">ID: AI_AGENT_SYNTHESIS_v3</span>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Neural Link Stable</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
              <span>Tone:</span>
              <span className="text-white font-medium">Professional Analytic</span>
            </div>
            <button className="px-4 py-1.5 bg-white text-black text-[10px] font-bold rounded uppercase tracking-widest hover:bg-gray-200 transition-colors">Export</button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'chat' ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-8 scrollbar-hide"
              >
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-20">
                    <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-8">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-light text-white mb-4 tracking-tight">Initiate Aetheris Intelligence</h2>
                    <p className="text-sm text-gray-500 mb-10 max-w-sm leading-relaxed">
                      Advanced multimodal synthesis engine ready for strategic reasoning, code crafting, and creative research.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-left">
                      {[
                        "Synthesize green hydrogen market trends",
                        "Architect a highly scalable React system",
                        "Generate a visual core for a tech brand",
                        "Reason through quantum computing limits"
                      ].map((item, i) => (
                        <button 
                          key={i}
                          onClick={() => setInput(item)}
                          className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/30 text-xs text-gray-400 hover:text-white transition-all group"
                        >
                          <span className="text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity mr-2">◇</span> {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className="flex gap-5 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={cn(
                      "w-8 h-8 rounded shrink-0 flex items-center justify-center text-[10px] font-bold text-white",
                      msg.role === 'user' ? "bg-white/10" : "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                    )}>
                      {msg.role === 'user' ? 'JS' : 'AI'}
                    </div>
                    
                    <div className={cn(
                      "flex-1 min-w-0",
                      msg.role === 'model' && "aether-glass rounded-2xl p-6"
                    )}>
                      {msg.role === 'model' && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="text-[9px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded uppercase font-bold tracking-wider">Thought Process</div>
                          <div className="text-[9px] text-gray-500 font-mono italic animate-pulse">SYNTHESIZING_RESPONSE...</div>
                        </div>
                      )}
                      <div className={cn(
                        "prose prose-invert prose-sm max-w-none leading-relaxed",
                        msg.role === 'user' ? "text-gray-300" : "text-gray-400"
                      )}>
                        <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-5 max-w-5xl mx-auto w-full">
                    <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="flex-1 aether-glass rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="text-[9px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded uppercase font-bold tracking-wider">Thinking</div>
                      </div>
                      <div className="flex gap-1.5 h-4 items-center">
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <div className="p-8 pt-0 shrink-0">
                <div className="relative max-w-4xl mx-auto group">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <button className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                      <Zap className="w-3 h-3" />
                    </button>
                    <div className="h-4 w-px bg-white/10"></div>
                  </div>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Command Aetheris Intelligence..." 
                    className="w-full bg-aether-surface border border-white/10 rounded-xl py-4 pl-20 pr-32 focus:outline-none focus:border-indigo-500/50 text-sm placeholder:text-gray-600 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button 
                      onClick={() => setView('image')}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold text-gray-500 uppercase tracking-widest transition-colors"
                    >
                      Genesis
                    </button>
                    <button 
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-center mt-4 gap-6">
                  {[
                    { color: 'bg-indigo-500', label: 'Deep Reasoning' },
                    { color: 'bg-emerald-500', label: 'Market Research' },
                    { color: 'bg-gray-600', label: 'Codex Synthesis' }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={cn("w-1 h-1 rounded-full", stat.color)} />
                      <span className="text-[9px] uppercase tracking-[0.15em] text-gray-600 font-bold">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full bg-linear-to-b from-aether-bg to-aether-panel overflow-hidden"
            >
              <div className="flex-1 p-8 md:p-12 overflow-y-auto scrollbar-hide">
                <div className="max-w-6xl mx-auto space-y-16">
                  <div className="text-center space-y-3">
                    <h2 className="text-4xl font-light text-white tracking-tight">Genesis Studio</h2>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-bold">Visual Core Synthesis Engine</p>
                  </div>

                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="aether-glass p-2 rounded-2xl flex items-center gap-2">
                       <input 
                        type="text" 
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
                        placeholder="Define visual parameters for manifesting..."
                        className="flex-1 bg-transparent border-none px-6 py-4 text-white focus:ring-0 text-sm placeholder:text-gray-600"
                      />
                      <button 
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !imagePrompt.trim()}
                        className="px-6 py-3 bg-white text-black text-[10px] font-bold rounded-xl hover:bg-indigo-400 transition-all disabled:opacity-50 uppercase tracking-widest h-12 flex items-center justify-center min-w-[140px]"
                      >
                        {isGeneratingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manifest'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isGeneratingImage && (
                      <div className="aspect-square rounded-2xl aether-glass flex flex-col items-center justify-center p-8 space-y-6 animate-pulse">
                         <div className="w-12 h-12 rounded bg-indigo-500/20 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-indigo-400" />
                         </div>
                         <div className="w-full space-y-3">
                            <div className="h-0.5 w-full bg-white/5">
                              <motion.div 
                                className="h-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"
                                animate={{ width: ['0%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </div>
                            <div className="flex justify-between text-[8px] font-mono text-gray-500 tracking-widest">
                              <span>DECODING_LATENT_SPACE</span>
                              <span>68%</span>
                            </div>
                         </div>
                      </div>
                    )}

                    {generatedImages.map((img, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-aether-surface"
                      >
                        <img 
                          src={img.url} 
                          alt={img.prompt}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-0 inset-x-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-[10px] text-gray-400 italic mb-2">Manifested Outcome:</p>
                          <p className="text-xs font-medium text-white line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">{img.prompt}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Right Utility Panel */}
      <aside className="w-72 bg-aether-panel border-l border-white/5 p-6 flex flex-col gap-8 shrink-0 hidden xl:flex">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-6 font-bold">Context Insights</h3>
          <div className="space-y-4">
            <div className="p-4 aether-glass rounded-xl">
              <div className="text-[9px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Domain Recognition</div>
              <div className="flex flex-wrap gap-1.5">
                {['Architectural Render', 'Carbon Capture', 'Modular Scaling'].map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-sm bg-indigo-500/10 text-indigo-300 text-[8px] font-medium border border-indigo-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-4 aether-glass rounded-xl space-y-3">
              <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Cognitive Latency</div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                  animate={{ width: isLoading ? '85%' : '20%' }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                 <span>MEM_USAGE</span>
                 <span>12.4 GB / 32 GB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="p-5 rounded-xl bg-linear-to-b from-transparent to-white/[0.02] border border-white/5">
            <h4 className="text-[10px] uppercase tracking-widest text-white mb-4 font-bold">Logic Trace</h4>
            <div className="space-y-3">
              {[
                { label: 'SCANNING_KNOWLEDGE_BASE...', active: false },
                { label: 'VECTORIZING_INPUT...', active: false },
                { label: 'SYNTHESIZING_STRATEGY...', active: isLoading }
              ].map((step, i) => (
                <div key={i} className={cn("flex items-center gap-2.5 transition-opacity duration-300", step.active ? "opacity-100" : "opacity-30")}>
                  <div className={cn("w-1 h-1 rounded-full shadow-[0_0_5px]", step.active ? "bg-indigo-500 shadow-indigo-500" : "bg-gray-500")} />
                  <span className="text-[8px] font-mono tracking-tighter uppercase whitespace-nowrap">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
