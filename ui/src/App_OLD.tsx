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
  Sparkles
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'
import { homeDir } from '@tauri-apps/api/path'

interface DownloadStatus {
  status: 'idle' | 'downloading' | 'success' | 'error'
  progress: number
  message: string
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

  useEffect(() => {
    // Set default output path to Videos folder
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
      // Start progress animation
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
      }, 500)

      // Call the actual Rust backend which executes Python script
      const result = await invoke('download_video', { 
        url: url.trim(), 
        outputPath: outputPath, 
        quality: quality 
      })

      clearInterval(progressInterval)

      setDownloadStatus({
        status: 'success',
        progress: 100,
        message: 'Mission accomplished! Video downloaded successfully!'
      })

      console.log('Download result:', result)

      // Reset after 3 seconds
      setTimeout(() => {
        setDownloadStatus({ status: 'idle', progress: 0, message: '' })
        setUrl('')
      }, 3000)

    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : String(error)
      setDownloadStatus({
        status: 'error',
        progress: 0,
        message: errorMessage.length > 150 
          ? errorMessage.substring(0, 150) + '...' 
          : errorMessage
      })
      
      console.error('Download error:', error)
      
      // Keep error visible longer
      setTimeout(() => {
        setDownloadStatus({ status: 'idle', progress: 0, message: '' })
      }, 10000)
    }
  }

  const qualityOptions = [
    { value: 'best', label: 'ULTRA', subtitle: '4K/Best', icon: Sparkles },
    { value: '720p', label: 'HD', subtitle: '720p', icon: Video },
    { value: '480p', label: 'SD', subtitle: '480p', icon: Video },
    { value: 'audio', label: 'MP3', subtitle: 'Audio', icon: Music },
  ]

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Modern gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]" />
      
      {/* Animated mesh gradient overlay */}
      <motion.div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          
          {/* Floating Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Youtube className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-black tracking-tighter"
                >
                  <span className="text-white">L1GHT</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-gradient"> TUBE</span>
                </motion.h1>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 mt-1"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 text-xs font-bold">ONLINE</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 text-xs">Premium Downloader</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="premium-card p-8"
          >

            {/* URL Input - Large & Centered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <label className="block text-sm font-semibold text-gray-400 mb-3">
                Video URL
              </label>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-20 blur-lg transition-opacity duration-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="relative w-full px-6 py-5 bg-[#1a1f2e]/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white text-lg placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 transition-all duration-300 shadow-xl"
                  onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                />
              </div>
            </motion.div>

            {/* Grid Layout */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              
              {/* Quality Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-400 mb-3">
                  Quality
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {qualityOptions.map((option, index) => {
                    const Icon = option.icon
                    const isSelected = quality === option.value
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => setQuality(option.value)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative p-4 rounded-xl transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/20'
                            : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="qualitySelected"
                            className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-xl"
                            transition={{ type: "spring", duration: 0.6 }}
                          />
                        )}
                        <div className="relative flex flex-col items-center gap-2">
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-cyan-400' : 'text-gray-500'}`} />
                          <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {option.label}
                          </span>
                          <span className={`text-xs ${isSelected ? 'text-cyan-400/70' : 'text-gray-600'}`}>
                            {option.subtitle}
                          </span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Save Location */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-400 mb-3">
                  Save Location
                </label>
                <div className="flex gap-3 h-full items-end">
                  <input
                    type="text"
                    value={outputPath}
                    readOnly
                    className="flex-1 px-5 py-4 bg-[#1a1f2e]/80 backdrop-blur-xl border border-white/10 rounded-xl text-gray-400 text-sm focus:outline-none cursor-default"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={selectFolder}
                    className="px-5 py-4 bg-[#1a1f2e]/80 backdrop-blur-xl border border-white/10 rounded-xl hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all duration-300 group"
                  >
                    <FolderOpen className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Download Button - Big & Bold */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(6, 182, 212, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={downloadStatus.status === 'downloading'}
              className="w-full py-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white font-black text-xl rounded-2xl shadow-2xl shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group mb-8"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <div className="relative flex items-center gap-3">
                {downloadStatus.status === 'downloading' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>DOWNLOADING...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    <span>START DOWNLOAD</span>
                  </>
                )}
              </div>
            </motion.button>

            {/* Status Section */}
            <AnimatePresence mode="wait">
              {downloadStatus.status !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {downloadStatus.status === 'downloading' && (
                    <motion.div className="mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-400">Progress</span>
                        <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                          {downloadStatus.progress}%
                        </span>
                      </div>
                      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${downloadStatus.progress}%` }}
                          className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 relative"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={`flex items-start gap-4 p-5 rounded-2xl backdrop-blur-xl ${
                      downloadStatus.status === 'success'
                        ? 'bg-emerald-500/10 border-2 border-emerald-500/30'
                        : downloadStatus.status === 'error'
                        ? 'bg-red-500/10 border-2 border-red-500/30'
                        : 'bg-cyan-500/10 border-2 border-cyan-500/30'
                    }`}
                  >
                    {downloadStatus.status === 'success' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : downloadStatus.status === 'error' ? (
                      <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm font-medium ${
                      downloadStatus.status === 'success'
                        ? 'text-emerald-300'
                        : downloadStatus.status === 'error'
                        ? 'text-red-300'
                        : 'text-cyan-300'
                    }`}>
                      {downloadStatus.message}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default App
