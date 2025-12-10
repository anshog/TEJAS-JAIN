import React, { useState } from 'react';
import { DrawingTool, ViewState, PRESET_COLORS, PRESET_PROMPTS } from './types';
import { generateColoringPage } from './services/geminiService';
import { Canvas } from './components/Canvas';
import { Palette, Wand2, Paintbrush, Eraser, Sparkles, Star, Rocket, Gamepad2, Gift, PaintBucket, Menu, Search, Apple } from 'lucide-react';

const CATEGORIES = [
  "All", "Animals", "Christmas", "Fruits", "Geometry", "Nature", 
  "People", "Shapes", "Vehicles", "Mandala", "Space", "Dinosaurs", "Princess", "Sports", "Robots"
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [tool, setTool] = useState<DrawingTool>({
    color: PRESET_COLORS[0],
    size: 20,
    type: 'brush'
  });

  const handleGenerate = async (searchPrompt: string) => {
    if (!searchPrompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setPrompt(searchPrompt);
    setView('GENERATING');

    try {
      const imageUrl = await generateColoringPage(searchPrompt);
      setGeneratedImage(imageUrl);
      setView('COLORING');
    } catch (err) {
      setError("Oops! The magic wand slipped. Try again!");
      setView('HOME');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (category === "All") {
        handleGenerate("A cute simple coloring page for kids");
    } else {
        handleGenerate(`A cute simple ${category} coloring page`);
    }
  };

  const getRandomIcon = (index: number) => {
    const icons = [Star, Rocket, Gamepad2, Gift, Sparkles];
    const Icon = icons[index % icons.length];
    return <Icon size={24} className="text-white" />;
  };

  const getCardColor = (index: number) => {
    const colors = [
      'bg-brand-pink border-brand-pink',
      'bg-brand-purple border-brand-purple',
      'bg-brand-yellow border-brand-yellow',
      'bg-brand-blue border-brand-blue',
      'bg-green-400 border-green-500'
    ];
    return colors[index % colors.length];
  };

  const renderHome = () => (
    <div className="min-h-screen flex flex-col items-center pt-10 pb-10 px-4 w-full max-w-7xl mx-auto font-sans">
      
      {/* Top Navigation / Logo Area */}
      <div className="w-full flex justify-between items-center mb-16 md:mb-24 px-4">
        <div className="flex items-center gap-4">
             {/* Logo Image - Tries local file first, falls back to remote URL */}
             <img 
                src="/mylogo.png" 
                alt="DoodleDream Logo" 
                onError={(e) => {
                  e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3755/3755353.png";
                  e.currentTarget.onerror = null; // Prevent infinite loop
                }}
                className="w-16 h-16 object-contain drop-shadow-md hover:rotate-6 transition-transform duration-300" 
             />
             <span className="text-3xl font-black text-slate-800 tracking-tight">DoodleDream</span>
        </div>
        <div className="hidden md:flex gap-6 font-bold text-slate-500 text-sm">
            <a href="#" className="hover:text-brand-pink transition-colors">Book</a>
            <a href="#" className="hover:text-brand-pink transition-colors">Doodling</a>
            <a href="#" className="hover:text-brand-pink transition-colors">Blogs</a>
            <a href="#" className="hover:text-brand-pink transition-colors">About</a>
        </div>
        <div className="flex gap-2">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center gap-2">
                Buy Coffee
            </button>
        </div>
      </div>

      {/* Hero Text */}
      <div className="text-center space-y-6 max-w-4xl mx-auto mb-16 relative z-10">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
          Free Coloring Pages
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Discover hundreds of beautiful coloring pages for kids. 
          Generate unique art with AI and color it instantly!
        </p>
        
        {/* Hero Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button 
              onClick={() => handleGenerate("Simple Shapes Pattern")}
              className="btn-3d bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-full font-bold text-lg shadow-[0_10px_20px_-10px_rgba(168,85,247,0.5)] hover:shadow-[0_20px_20px_-10px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-all flex items-center gap-3"
          >
              <Palette size={24} />
              Start Doodling - Draw on Shapes!
          </button>
          
          <button className="btn-3d bg-slate-900 text-white px-8 py-5 rounded-full font-bold text-lg shadow-xl hover:bg-slate-800 flex items-center gap-3 transition-transform hover:-translate-y-1">
               <Apple size={24} fill="white" />
              Download on the App Store
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Bar */}
      <div className="w-full max-w-6xl mb-20 relative group z-20">
         <div className="bg-white rounded-full shadow-2xl p-3 flex items-center gap-2 overflow-x-auto custom-scrollbar border border-slate-100">
            
            {/* Search Toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSearchOpen ? 'bg-brand-pink text-white rotate-90' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
               <Search size={22} strokeWidth={3} />
            </button>

            {/* Categories */}
            {CATEGORIES.map((cat, i) => (
               <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex-shrink-0 px-8 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                      activeCategory === cat || (i === 0 && activeCategory === 'All')
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
               >
                  {cat}
               </button>
            ))}
         </div>

         {/* Search Input Dropdown (Conditionally Rendered) */}
         {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-4 flex justify-center animate-in fade-in slide-in-from-top-2">
               <div className="bg-white p-2 rounded-2xl shadow-2xl border-4 border-slate-100 flex gap-2 w-full max-w-2xl">
                  <input 
                     autoFocus
                     type="text"
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleGenerate(prompt)}
                     placeholder="Type what you want to color (e.g. 'A cute dinosaur')..."
                     className="flex-1 bg-slate-50 px-6 py-4 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 ring-brand-blue/50 placeholder:font-normal"
                  />
                  <button 
                    onClick={() => handleGenerate(prompt)}
                    className="bg-brand-pink text-white px-8 rounded-xl font-bold hover:bg-pink-600 transition-colors"
                  >
                    Go
                  </button>
               </div>
            </div>
         )}
      </div>

      {/* Popular Categories Grid */}
      <div className="w-full max-w-6xl pb-20">
         <h3 className="text-4xl font-black text-slate-800 mb-12 text-center">Popular Coloring Pages</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
             {PRESET_PROMPTS.map((p, index) => {
                const colorClass = getCardColor(index);
                // const shadowColor ...

                return (
                  <button
                    key={p}
                    onClick={() => handleGenerate(p)}
                    className={`btn-3d group relative overflow-hidden rounded-[2.5rem] p-8 text-left transition-all hover:-translate-y-2 bg-white border-4 border-slate-100 shadow-xl hover:shadow-2xl h-64 flex flex-col justify-between`}
                  >
                    {/* Decorative Background Blob */}
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100%] opacity-10 ${colorClass.split(' ')[0]}`}></div>
                    
                    <div className="relative z-10">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${colorClass.split(' ')[0]} text-white shadow-lg`}>
                        {getRandomIcon(index)}
                      </div>
                      <span className="font-black text-slate-700 text-2xl leading-tight block group-hover:text-brand-blue transition-colors">{p}</span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">AI Generated</span>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-blue group-hover:text-white transition-all">
                            <Wand2 size={18} />
                        </div>
                    </div>
                  </button>
                );
             })}
         </div>
      </div>

      {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 p-6 bg-red-100 text-red-600 rounded-[2rem] font-black border-4 border-red-200 text-center animate-bounce shadow-2xl z-50">
          {error}
          </div>
      )}
    </div>
  );

  const renderLoading = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/30 rounded-full animate-ping"></div>

      <div className="relative z-10 bg-white/95 backdrop-blur-md p-12 rounded-[3rem] shadow-2xl text-center border-8 border-white max-w-lg w-full">
        <div className="mb-10 relative inline-block">
            <div className="w-40 h-40 border-[12px] border-blue-100 border-t-brand-pink rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
             <Wand2 className="text-brand-yellow animate-bounce" size={64} strokeWidth={3} />
            </div>
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Making Magic...</h2>
        <div className="bg-blue-50 px-8 py-4 rounded-3xl inline-block border-2 border-blue-100">
           <p className="text-brand-pink text-xl font-bold">"{prompt}"</p>
        </div>
      </div>
    </div>
  );

  const renderColoring = () => (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#e0f2fe] p-3 md:p-6 gap-4 md:gap-6">
      
      {/* Left Sidebar - Tools */}
      <div className="md:w-[340px] flex-shrink-0 flex flex-col gap-4 h-full">
        {/* Logo Card */}
        <div className="bg-white rounded-3xl p-4 shadow-xl border-b-8 border-slate-200 flex items-center justify-center gap-3 shrink-0 cursor-pointer hover:bg-slate-50 transition-colors group" onClick={() => setView('HOME')}>
             <img 
                src="/mylogo.png"
                alt="DoodleDream Logo" 
                onError={(e) => {
                  e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3755/3755353.png";
                  e.currentTarget.onerror = null;
                }}
                className="w-12 h-12 object-contain group-hover:rotate-12 transition-transform duration-300" 
             />
             <span className="font-black text-slate-800 text-2xl tracking-tight">DoodleDream</span>
        </div>

        {/* Tools Card */}
        <div className="bg-white rounded-[2.5rem] p-5 md:p-6 shadow-xl border-b-[8px] border-slate-200 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            
            {/* Tool Type */}
            <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Menu size={16} /> Tools
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setTool({ ...tool, type: 'bucket' })}
                        className={`btn-3d py-5 rounded-2xl font-bold flex flex-col items-center gap-2 border-b-[6px] transition-all group ${
                            tool.type === 'bucket' 
                            ? 'bg-brand-yellow border-yellow-600 text-white shadow-lg' 
                            : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <PaintBucket size={32} strokeWidth={3} className={tool.type === 'bucket' ? 'animate-bounce' : ''} />
                        <span className="text-sm">Fill</span>
                    </button>
                    <button
                        onClick={() => setTool({ ...tool, type: 'brush' })}
                        className={`btn-3d py-5 rounded-2xl font-bold flex flex-col items-center gap-2 border-b-[6px] transition-all group ${
                            tool.type === 'brush' 
                            ? 'bg-brand-blue border-blue-700 text-white shadow-lg' 
                            : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <Paintbrush size={32} strokeWidth={3} className={tool.type === 'brush' ? 'animate-pulse' : ''} />
                        <span className="text-sm">Brush</span>
                    </button>
                    <button
                        onClick={() => setTool({ ...tool, type: 'eraser' })}
                        className={`btn-3d py-5 rounded-2xl font-bold flex flex-col items-center gap-2 border-b-[6px] transition-all col-span-2 ${
                            tool.type === 'eraser' 
                            ? 'bg-brand-pink border-pink-700 text-white shadow-lg' 
                            : 'bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <Eraser size={32} strokeWidth={3} />
                        <span className="text-sm">Eraser</span>
                    </button>
                </div>
            </div>

            {/* Size Slider - Only show for brush/eraser */}
            {tool.type !== 'bucket' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                  <div className="flex justify-between items-center ml-1">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Size</h4>
                      <span className="bg-white text-slate-600 px-3 py-1 rounded-lg text-xs font-black border border-slate-200">{tool.size}px</span>
                  </div>
                  <div className="px-2">
                      <input 
                          type="range" 
                          min="5" 
                          max="60" 
                          value={tool.size} 
                          onChange={(e) => setTool({...tool, size: parseInt(e.target.value)})}
                          className="w-full h-4 bg-slate-200 rounded-full appearance-none cursor-pointer accent-brand-pink hover:accent-pink-600"
                      />
                  </div>
              </div>
            )}

            {/* Color Grid */}
            <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Palette size={16} /> Colors
                </h4>
                <div className="grid grid-cols-4 gap-3">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => setTool({ ...tool, color: c, type: tool.type === 'eraser' ? 'brush' : tool.type })}
                            className={`aspect-square rounded-2xl border-b-[6px] transition-all transform hover:scale-105 active:scale-95 ${
                                tool.color === c && tool.type !== 'eraser'
                                ? 'border-black/20 scale-110 shadow-xl ring-4 ring-offset-2 ring-brand-blue z-10' 
                                : 'border-black/10'
                            }`}
                            style={{ backgroundColor: c }}
                            aria-label={`Color ${c}`}
                        />
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 h-full relative flex flex-col min-h-0">
        {generatedImage && (
            <Canvas 
                imageSrc={generatedImage} 
                tool={tool} 
                onBack={() => setView('HOME')}
                setTool={setTool}
            />
        )}
      </div>
    </div>
  );

  return (
    <>
      {view === 'HOME' && renderHome()}
      {view === 'GENERATING' && renderLoading()}
      {view === 'COLORING' && renderColoring()}
    </>
  );
};

export default App;