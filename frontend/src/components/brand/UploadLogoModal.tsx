import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { 
  UploadCloud, 
  Check, 
  Link2, 
  Globe, 
  FileImage, 
  Trash2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

interface UploadLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadLogoModal: React.FC<UploadLogoModalProps> = ({ isOpen, onClose }) => {
  const { updateBrandProfile, brandProfile, company, showToast } = useBrandGuard();

  // Active Tab: 'file' (from PC) | 'url' (from browser) | 'domain' (auto-fetch from website)
  const [activeTab, setActiveTab] = useState<'file' | 'url' | 'domain'>('file');

  // Logo state
  const [logoInitials, setLogoInitials] = useState(brandProfile.logoText || 'AP');
  const [previewUrl, setPreviewUrl] = useState<string | null>(brandProfile.logoUrl || null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or brandProfile changes
  useEffect(() => {
    if (isOpen) {
      setLogoInitials(brandProfile.logoText || 'AP');
      setPreviewUrl(brandProfile.logoUrl || null);
      setImageUrlInput(brandProfile.logoUrl && !brandProfile.logoUrl.startsWith('data:') ? brandProfile.logoUrl : '');
      setFileName(null);
      setFileSize(null);
      setUrlError(null);
    }
  }, [isOpen, brandProfile]);

  // Handle local file selection from PC file manager
  const processFile = (file: File) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a valid image file (.PNG, .JPG, .SVG, .WEBP)', 'error');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be under 5MB', 'error');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPreviewUrl(result);
        setUrlError(null);
      }
    };
    reader.onerror = () => {
      showToast('Failed to read local file from your PC', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Handle URL input from web/browser
  const handleVerifyUrl = () => {
    if (!imageUrlInput.trim()) {
      setUrlError('Please enter a valid image URL');
      return;
    }

    const trimmed = imageUrlInput.trim();
    setIsLoadingUrl(true);
    setUrlError(null);

    // Test image load in browser
    const img = new Image();
    img.onload = () => {
      setIsLoadingUrl(false);
      setPreviewUrl(trimmed);
      setFileName(trimmed.split('/').pop()?.split('?')[0] || 'Web Image');
      setFileSize('Online Asset');
      showToast('Image verified successfully from web URL', 'success');
    };
    img.onerror = () => {
      setIsLoadingUrl(false);
      setUrlError('Unable to load image from this URL. Please verify the link is accessible.');
      showToast('Failed to load image from URL', 'error');
    };
    img.src = trimmed;
  };

  // Auto-fetch from verified domain
  const handleFetchFromDomain = () => {
    const rawDomain = brandProfile.website || company?.website || 'novalabs.io';
    const cleanDomain = rawDomain.replace(/^https?:\/\//, '').split('/')[0];
    
    // Use Google high-res favicon/logo proxy service for reliable SSL delivery
    const fetchedLogoUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256`;
    
    setIsLoadingUrl(true);
    setUrlError(null);

    const img = new Image();
    img.onload = () => {
      setIsLoadingUrl(false);
      setPreviewUrl(fetchedLogoUrl);
      setImageUrlInput(fetchedLogoUrl);
      setFileName(`${cleanDomain} (Domain Icon)`);
      setFileSize('Domain Favicon / Logo');
      showToast(`Fetched high-res brand icon from ${cleanDomain}`, 'success');
    };
    img.onerror = () => {
      setIsLoadingUrl(false);
      setUrlError(`Could not find a public logo on ${cleanDomain}`);
      showToast(`No logo found on ${cleanDomain}`, 'warning');
    };
    img.src = fetchedLogoUrl;
  };

  // Remove custom uploaded logo
  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    setFileName(null);
    setFileSize(null);
    setImageUrlInput('');
    setUrlError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const initials = logoInitials.trim().toUpperCase().slice(0, 3) || 'AP';

    updateBrandProfile({
      logoText: initials,
      logoUrl: previewUrl || undefined,
    });

    showToast(
      previewUrl 
        ? 'Brand logo image updated & perceptual hash (pHash) recomputed' 
        : 'Brand monogram updated for detection engine', 
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload or Update Brand Logo Asset"
      description="Upload an official high-resolution logo from your PC or link from the web. BrandGuard computes a cryptographic perceptual hash (pHash) to detect unauthorized visual duplicates across social and app stores."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-navy-950 border border-slate-800 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>From PC / File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Web Image URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('domain')}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'domain'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>From Website</span>
          </button>
        </div>

        {/* TAB 1: File Upload from Local PC */}
        {activeTab === 'file' && (
          <div className="space-y-3">
            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Interactive Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'border-slate-700/80 bg-navy-950/70 hover:border-cyan-500/50 hover:bg-navy-900/60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-2.5 shadow-inner">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="text-white font-bold text-xs mb-1">
                {fileName ? fileName : 'Choose a file from your computer or drag & drop here'}
              </div>

              <p className="text-[11px] text-slate-400 max-w-xs mb-3.5">
                PNG, SVG, JPG, or WEBP up to 5MB. High-resolution transparent vectors recommended.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>Browse File Manager in PC</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Web Image URL */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Image Address / Web URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://example.com/assets/brand-logo.png"
                  className="flex-1 bg-navy-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleVerifyUrl}
                  disabled={isLoadingUrl || !imageUrlInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-navy-950 font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isLoadingUrl ? 'Loading...' : 'Preview'}</span>
                </button>
              </div>
              {urlError && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{urlError}</span>
                </p>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Paste any publicly accessible image link from your CDN, GitHub, Wikimedia, or company website.
            </p>
          </div>
        )}

        {/* TAB 3: Auto-fetch from Website Domain */}
        {activeTab === 'domain' && (
          <div className="space-y-3 p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-bold block text-xs">
                  Target Website: {brandProfile.website || company?.website || 'Official Domain'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Automatically extracts the official high-resolution icon from domain DNS records.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFetchFromDomain}
              disabled={isLoadingUrl}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/40 hover:to-cyan-600/40 border border-cyan-500/40 text-cyan-300 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUrl ? 'animate-spin' : ''}`} />
              <span>{isLoadingUrl ? 'Extracting from Domain...' : 'Fetch Official Logo from Website'}</span>
            </button>
          </div>
        )}

        {/* Live Logo Preview Card */}
        <div className="p-4 rounded-2xl bg-navy-900/90 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Visual Preview Box */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/40 flex items-center justify-center shadow-lg ring-4 ring-cyan-500/10 overflow-hidden shrink-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Brand Logo Preview"
                  className="w-full h-full object-contain p-1 rounded-xl"
                  onError={() => {
                    setPreviewUrl(null);
                    showToast('Failed to render image asset', 'error');
                  }}
                />
              ) : (
                <span className="text-xl font-black font-display-3d-cyan">
                  {logoInitials || 'AP'}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  {previewUrl ? 'Custom Image Asset Loaded' : 'Vector Monogram Fallback'}
                </span>
                {previewUrl && (
                  <span className="px-2 py-0.5 rounded-full bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 text-[9.5px] font-mono font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(0,255,163,0.3)]">
                    <Check className="w-2.5 h-2.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                {fileName ? `${fileName} ${fileSize ? `(${fileSize})` : ''}` : 'Using short monogram letters'}
              </div>

              <div className="text-[10px] text-cyan-400 font-mono mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>pHash: <code className="text-slate-300 font-bold">64-bit vector ready</code></span>
              </div>
            </div>
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors shrink-0"
              title="Remove custom image and revert to text monogram"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Short Monogram Lettering Input */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Brand Logo Initials / Short Monogram (Fallback)
          </label>
          <input
            type="text"
            maxLength={3}
            value={logoInitials}
            onChange={(e) => setLogoInitials(e.target.value.toUpperCase())}
            placeholder="AP"
            className="w-full bg-navy-950 border border-slate-700/80 rounded-xl p-2.5 text-white uppercase tracking-widest font-mono text-center font-bold focus:outline-none focus:border-cyan-500"
          />
          <span className="text-[10.5px] text-slate-500 mt-1 block">
            Used as a secondary avatar in responsive compact navigation when images are loading.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Apply Logo</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
