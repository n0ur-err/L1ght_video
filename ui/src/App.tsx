import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  Youtube, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  FolderOpen,
  Music,
  Video,
  Sparkles,
  Activity,
  Clock,
  HardDrive,
  Zap,
  X,
  Minus,
  Square
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'
import { homeDir } from '@tauri-apps/api/path'
import { getCurrent } from '@tauri-apps/api/window'

const appWindow = getCurrent()

interface DownloadStatus {
  status: 'idle' | 'downloading' | 'success' | 'error'
  progress: number
  message: string
}

interface HistoryItem {
  id: string
  title: string
  time: string
  quality: string
  url: string
  filePath: string
}

function App() {
  const [url, setUrl] = useState('')
  const [outputPath, setOutputPath] = useState('')
  const [quality, setQuality] = useState('best')
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  })
  
  // GUI state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [statsOpen, setStatsOpen] = useState(false)
  const [downloadHistory, setDownloadHistory] = useState<HistoryItem[]>([])
  const [downloadSpeed, setDownloadSpeed] = useState('0 MB/s')
  const [eta, setEta] = useState('--:--')
  const [currentView, setCurrentView] = useState<'download' | 'history' | 'library'>('download')
  const [isCompactMode, setIsCompactMode] = useState(false)

  // Detect window size and toggle compact mode
  useEffect(() => {
    const checkWindowSize = async () => {
      const size = await appWindow.innerSize()
      setIsCompactMode(size.width < 900)
      // Close sidebars in compact mode
      if (size.width < 900) {
        setSidebarOpen(false)
        setStatsOpen(false)
      }
    }
    
    checkWindowSize()
    
    const unlisten = appWindow.onResized(() => {
      checkWindowSize()
    })
    
    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('downloadHistory')
    if (saved) {
      try {
        setDownloadHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load history:', e)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (downloadHistory.length > 0) {
      localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory))
    }
  }, [downloadHistory])

  useEffect(() => {
    homeDir().then(home => {
      setOutputPath(`${home}Videos`)
    })
  }, [])

  const selectFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: outputPath,
    })
    if (selected && typeof selected === 'string') {
      setOutputPath(selected)
    }
  }

  const handleDownload = async () => {
    if (!url.trim()) {
      setDownloadStatus({
        status: 'error',
        progress: 0,
        message: 'Please enter a YouTube URL'
      })
      return
    }

    setDownloadStatus({
      status: 'downloading',
      progress: 0,
      message: 'Starting download...'
    })

    try {
      const progressInterval = setInterval(() => {
        setDownloadStatus(prev => {
          if (prev.progress < 90) {
            return {
              ...prev,
              progress: prev.progress + 5,
              message: prev.progress < 50 ? 'Downloading video...' : 'Processing and merging...'
            }
          }
          return prev
        })
        // Simulate speed
        setDownloadSpeed(`${(Math.random() * 5 + 2).toFixed(1)} MB/s`)
        setEta(`${Math.floor(Math.random() * 60)}s`)
      }, 500)

      await invoke('download_video', { 
        url: url.trim(), 
        outputPath: outputPath, 
        quality: quality 
      })

      clearInterval(progressInterval)

      setDownloadStatus({
        status: 'success',
        progress: 100,
        message: 'Download complete!'
      })

      // Add to history - generate likely filename
      const videoId = url.split('v=')[1]?.split('&')[0] || 'video'
      const timestamp = new Date().toISOString().split('T')[0]
      const extension = quality === 'audio' ? 'mp3' : 'mp4'
      const likelyFilename = `${videoId}_${timestamp}.${extension}`
      const likelyPath = `${outputPath}\\${likelyFilename}`
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        title: videoId,
        time: new Date().toLocaleTimeString(),
        quality: quality,
        url: url,
        filePath: likelyPath
      }
      setDownloadHistory(prev => [newItem, ...prev])

      setTimeout(() => {
        setDownloadStatus({
          status: 'idle',
          progress: 0,
          message: ''
        })
        setUrl('')
      }, 3000)

    } catch (error) {
      setDownloadStatus({
        status: 'error',
        progress: 0,
        message: `Error: ${error}`
      })
    }
  }

  const qualityOptions = [
    { value: 'best', label: 'ULTRA', subtitle: '4K/1080p', icon: Sparkles },
    { value: '720p', label: 'HD', subtitle: '720p', icon: Video },
    { value: '480p', label: 'SD', subtitle: '480p', icon: Video },
    { value: 'audio', label: 'MP3', subtitle: 'Audio Only', icon: Music }
  ]

  return (
    <div className="h-screen bg-[#0a0e1a] overflow-hidden flex flex-col">
      
      {/* CUSTOM TITLE BAR */}
      <div 
        data-tauri-drag-region 
        className="h-10 bg-black/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 relative z-50 select-none cursor-move"
      >
        <div data-tauri-drag-region className="flex items-center gap-2 flex-1 cursor-move">
          <Youtube className="w-4 h-4 text-cyan-400 pointer-events-none" />
          <span className="text-xs font-bold text-gray-400 pointer-events-none">L1GHT TUBE</span>
        </div>
        
        <div className="flex items-center gap-1 cursor-default">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              appWindow.minimize().catch(err => console.error('Minimize failed:', err))
            }}
            className="w-10 h-8 flex items-center justify-center rounded hover:bg-white/10 active:bg-white/20 transition-colors group cursor-pointer"
          >
            <Minus className="w-4 h-4 text-gray-400 group-hover:text-white pointer-events-none" />
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              appWindow.toggleMaximize().catch(err => console.error('Maximize failed:', err))
            }}
            className="w-10 h-8 flex items-center justify-center rounded hover:bg-white/10 active:bg-white/20 transition-colors group cursor-pointer"
          >
            <Square className="w-3 h-3 text-gray-400 group-hover:text-white pointer-events-none" />
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              appWindow.close().catch(err => console.error('Close failed:', err))
            }}
            className="w-10 h-8 flex items-center justify-center rounded hover:bg-red-500/80 active:bg-red-600 transition-colors group cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-white pointer-events-none" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex overflow-hidden relative">
      
      {/* Animated particle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(isCompactMode ? 10 : 30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#a855f7' : '#3b82f6',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* COMPACT MODE - Simple centered layout */}
      {isCompactMode ? (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md space-y-6">
            {/* Logo */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <Youtube className="w-16 h-16 text-cyan-400 mx-auto" />
              </motion.div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                L1GHT TUBE
              </h1>
            </motion.div>

            {/* URL Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                  placeholder="Paste YouTube URL here..."
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Quality Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
            >
              <p className="text-xs text-gray-500 mb-3 text-center">Quality</p>
              <div className="grid grid-cols-4 gap-2">
                {qualityOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = quality === option.value
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => setQuality(option.value)}
                      className={`relative p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-white/10 bg-black/30'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={`w-6 h-6 mx-auto ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                      <p className={`text-xs mt-1 font-bold ${isSelected ? 'text-cyan-400' : 'text-gray-500'}`}>
                        {option.label}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            {/* Download Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={handleDownload}
                disabled={downloadStatus.status === 'downloading'}
                className="relative w-full py-6 rounded-2xl overflow-hidden disabled:opacity-50"
                whileHover={{ scale: downloadStatus.status === 'downloading' ? 1 : 1.02 }}
                whileTap={{ scale: downloadStatus.status === 'downloading' ? 1 : 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {downloadStatus.status === 'downloading' ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-lg font-black text-white">DOWNLOADING...</span>
                    </>
                  ) : downloadStatus.status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="text-lg font-black text-white">SUCCESS!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      <span className="text-lg font-black text-white">DOWNLOAD</span>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>

            {/* Compact Progress */}
            <AnimatePresence>
              {downloadStatus.status === 'downloading' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{downloadStatus.message}</span>
                    <span className="text-lg font-bold text-cyan-400">{downloadStatus.progress}%</span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadStatus.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Messages */}
            <AnimatePresence>
              {downloadStatus.status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-sm text-red-400">{downloadStatus.message}</p>
                </motion.div>
              )}
              
              {downloadStatus.status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-green-400">{downloadStatus.message}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <>
        {/* FULL MODE - 3 Panel Layout */}
        {/* LEFT SIDEBAR */}
        <motion.div
          className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col relative z-10"
          initial={{ x: -288 }}
          animate={{ x: sidebarOpen ? 0 : -288 }}
          transition={{ type: "spring", damping: 20 }}
        >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex-shrink-0"
            >
              <Youtube className="w-12 h-12 text-cyan-400" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                L1GHT
              </h1>
              <p className="text-sm text-gray-400 font-semibold">TUBE</p>
            </div>
          </div>
        </div>
        
        {/* Nav buttons */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <motion.button
            onClick={() => setCurrentView('download')}
            className={`w-full px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-colors ${
              currentView === 'download'
                ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-transparent'
            }`}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5" />
            <span>New Download</span>
          </motion.button>
          
          <motion.button
            onClick={() => setCurrentView('history')}
            className={`w-full px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-colors ${
              currentView === 'history'
                ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-transparent'
            }`}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Clock className="w-5 h-5" />
            <span>History</span>
          </motion.button>

          <motion.button
            onClick={() => setCurrentView('library')}
            className={`w-full px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-colors ${
              currentView === 'library'
                ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-transparent'
            }`}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <FolderOpen className="w-5 h-5" />
            <span>Library</span>
          </motion.button>
        </div>
        
        {/* Recent downloads */}
        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 uppercase font-semibold">Recent</p>
            <span className="text-xs text-cyan-400 font-bold">{downloadHistory.length}</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {downloadHistory.slice(0, 10).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-gray-300 text-xs font-medium truncate flex-1">{item.title}</p>
                    <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                      {item.quality === 'best' ? 'ULTRA' : item.quality === '720p' ? 'HD' : item.quality === '480p' ? 'SD' : 'MP3'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
            {downloadHistory.length === 0 && (
              <div className="text-center py-8">
                <Download className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-xs">No downloads yet</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* CENTER PANEL - Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* Header bar */}
        <div className="h-16 border-b border-white/5 backdrop-blur-xl bg-black/20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
            <h2 className="text-lg font-bold text-white">
              {currentView === 'download' ? 'Download Center' : currentView === 'history' ? 'Download History' : 'Library'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setStatsOpen(!statsOpen)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Activity className="w-5 h-5 text-cyan-400" />
            </motion.button>
            
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400 text-sm font-medium">ONLINE</span>
            </motion.div>
          </div>
        </div>

        {/* Main content - switches based on view */}
        <div className="flex-1 p-10 overflow-y-auto">
          
          {/* DOWNLOAD VIEW */}
          {currentView === 'download' && (
            <div className="max-w-5xl mx-auto space-y-8">
            
            {/* URL Input Card - 3D flip animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-gray-400 mb-3">YouTube URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-6 py-4 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-lg"
                    />
                    <motion.div
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Youtube className="w-6 h-6 text-cyan-400/50" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quality Selector - Carousel style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <label className="block text-sm font-semibold text-gray-400 mb-6">Select Quality</label>
              <div className="grid grid-cols-4 gap-6">
                {qualityOptions.map((option, index) => {
                  const Icon = option.icon
                  const isSelected = quality === option.value
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => setQuality(option.value)}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-white/10 bg-black/30 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      {isSelected && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl"
                          layoutId="quality-selector"
                          transition={{ type: "spring", damping: 20 }}
                        />
                      )}
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <Icon className={`w-10 h-10 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                        <div className="text-center">
                          <p className={`font-bold text-lg ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                            {option.label}
                          </p>
                          <p className="text-sm text-gray-500">{option.subtitle}</p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            {/* Output path */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <label className="block text-sm font-semibold text-gray-400 mb-3">Save Location</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={outputPath}
                  readOnly
                  className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white text-sm"
                />
                <motion.button
                  onClick={selectFolder}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FolderOpen className="w-5 h-5" />
                  Browse
                </motion.button>
              </div>
            </motion.div>

            {/* Download Button - BIG */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={handleDownload}
                disabled={downloadStatus.status === 'downloading'}
                className="relative w-full py-8 rounded-2xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: downloadStatus.status === 'downloading' ? 1 : 1.02 }}
                whileTap={{ scale: downloadStatus.status === 'downloading' ? 1 : 0.98 }}
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />

                <div className="relative z-10 flex items-center justify-center gap-3">
                  {downloadStatus.status === 'downloading' ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-2xl font-black text-white">DOWNLOADING...</span>
                    </>
                  ) : downloadStatus.status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-8 h-8" />
                      <span className="text-2xl font-black text-white">SUCCESS!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-8 h-8" />
                      <span className="text-2xl font-black text-white">START DOWNLOAD</span>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>

            {/* Enhanced Progress section */}
            <AnimatePresence>
              {downloadStatus.status === 'downloading' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="relative overflow-hidden"
                >
                  {/* Glowing border effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(6,182,212,0.3)',
                        '0 0 40px rgba(6,182,212,0.5)',
                        '0 0 20px rgba(6,182,212,0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <div className="relative bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8">
                    {/* Progress circle and stats */}
                    <div className="flex items-center gap-8 mb-6">
                      {/* Circular progress */}
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="rgba(6,182,212,0.1)"
                            strokeWidth="8"
                            fill="none"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "0 352" }}
                            animate={{ 
                              strokeDasharray: `${(downloadStatus.progress / 100) * 352} 352` 
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="50%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.span 
                            key={downloadStatus.progress}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                          >
                            {downloadStatus.progress}%
                          </motion.span>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Status</p>
                          <motion.p 
                            key={downloadStatus.message}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-lg font-bold text-white"
                          >
                            {downloadStatus.message}
                          </motion.p>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Speed</p>
                            <p className="text-sm font-bold text-cyan-400">{downloadSpeed}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">ETA</p>
                            <p className="text-sm font-bold text-purple-400">{eta}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Linear progress bar */}
                    <div className="relative h-2 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                        initial={{ x: '-100%' }}
                        animate={{ x: `${downloadStatus.progress - 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        {/* Shimmer on progress bar */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </motion.div>
                    </div>
                    
                    {/* Animated particles */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [-20, -40],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status messages */}
            <AnimatePresence>
              {downloadStatus.status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
                >
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <p className="text-red-400 font-medium">{downloadStatus.message}</p>
                </motion.div>
              )}
              
              {downloadStatus.status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <p className="text-green-400 font-medium">{downloadStatus.message}</p>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          )}

          {/* HISTORY VIEW */}
          {currentView === 'history' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Download History</h3>
                <p className="text-gray-400">View and manage your downloaded videos</p>
              </div>

              {downloadHistory.length === 0 ? (
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center">
                  <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">No History Yet</h3>
                  <p className="text-gray-600">Your downloaded videos will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {downloadHistory.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            {item.quality === 'audio' ? (
                              <Music className="w-8 h-8 text-cyan-400" />
                            ) : (
                              <Video className="w-8 h-8 text-cyan-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold text-white mb-1 truncate">Video ID: {item.title}</h4>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {item.time}
                              </span>
                              <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 text-xs font-bold">
                                {item.quality === 'best' ? 'ULTRA' : item.quality === '720p' ? 'HD' : item.quality === '480p' ? 'SD' : 'MP3'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              try {
                                await invoke('open_file_location', { filePath: item.filePath })
                              } catch (error) {
                                console.error('Failed to open file:', error)
                                // Fallback to opening the folder
                                await invoke('open_folder', { path: outputPath }).catch(console.error)
                              }
                            }}
                            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
                          >
                            <FolderOpen className="w-4 h-4" />
                            Open
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* LIBRARY VIEW */}
          {currentView === 'library' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Your Library</h3>
                <p className="text-gray-400">Access your downloaded files</p>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-white">Download Folder</h4>
                    <p className="text-sm text-gray-400 mt-1">{outputPath}</p>
                  </div>
                  <motion.button
                    onClick={selectFolder}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 font-semibold transition-colors flex items-center gap-2"
                  >
                    <FolderOpen className="w-5 h-5" />
                    Change Location
                  </motion.button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Video className="w-6 h-6 text-cyan-400" />
                      <span className="text-sm text-gray-400">Videos</span>
                    </div>
                    <p className="text-3xl font-black text-cyan-400">
                      {downloadHistory.filter(h => h.quality !== 'audio').length}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Music className="w-6 h-6 text-purple-400" />
                      <span className="text-sm text-gray-400">Audio Files</span>
                    </div>
                    <p className="text-3xl font-black text-purple-400">
                      {downloadHistory.filter(h => h.quality === 'audio').length}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    try {
                      await invoke('open_folder', { path: outputPath })
                      console.log('Opened folder:', outputPath)
                    } catch (error) {
                      console.error('Failed to open folder:', error)
                      alert(`Failed to open folder: ${error}`)
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow"
                >
                  Open Download Folder
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT STATS PANEL */}
      <motion.div
        className="w-96 bg-black/40 backdrop-blur-xl border-l border-white/5 flex flex-col relative z-10"
        initial={{ x: 384 }}
        animate={{ x: statsOpen ? 0 : 384 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Live Stats
          </h3>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* Download Speed */}
          <motion.div
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4"
            animate={{
              boxShadow: ['0 0 20px rgba(6,182,212,0.1)', '0 0 30px rgba(6,182,212,0.2)', '0 0 20px rgba(6,182,212,0.1)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Speed
              </span>
              <motion.span
                key={downloadSpeed}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-black text-cyan-400"
              >
                {downloadSpeed}
              </motion.span>
            </div>
            <div className="h-16 flex items-end gap-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-cyan-500/30 rounded-t"
                  animate={{
                    height: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* ETA */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                ETA
              </span>
              <span className="text-xl font-black text-purple-400">{eta}</span>
            </div>
          </div>

          {/* Storage */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Storage
              </span>
              <span className="text-sm font-bold text-blue-400">256 GB Free</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: '0%' }}
                animate={{ width: '65%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Downloads today */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-2">Downloads Today</p>
            <p className="text-4xl font-black text-white">{downloadHistory.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Toggle buttons for panels */}
      {!sidebarOpen && !isCompactMode && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-12 z-20 p-2 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-black/80 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      )}

      {!statsOpen && !isCompactMode && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setStatsOpen(true)}
          className="fixed right-4 top-12 z-20 p-2 rounded-lg bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-black/80 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          <Activity className="w-5 h-5 text-cyan-400" />
        </motion.button>
      )}
      </>
      )}
      </div>
    </div>
  )
}

export default App
