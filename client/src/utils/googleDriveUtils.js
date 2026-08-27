/**
 * Google Drive & Image utility functions for cover image handling
 */

export const FALLBACK_BOOK_COVER =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';

/**
 * Extract Google Drive file ID from various link formats or raw ID.
 * Examples:
 * - https://drive.google.com/file/d/1A2B3C4D5E6F7G/view?usp=sharing
 * - https://drive.google.com/open?id=1A2B3C4D5E6F7G
 * - https://drive.google.com/uc?id=1A2B3C4D5E6F7G
 * - https://lh3.googleusercontent.com/d/1A2B3C4D5E6F7G
 * - 1A2B3C4D5E6F7G
 */
export const extractGoogleDriveFileId = (input) => {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();
  if (!str) return null;

  // Direct file ID check (alphanumeric with hyphen/underscore, 20+ chars)
  if (!str.includes('/') && !str.includes('.') && str.length >= 20) {
    return str;
  }

  // Regex patterns for Google Drive URL formats
  const fileDMatch = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  const idQueryMatch = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idQueryMatch && idQueryMatch[1]) return idQueryMatch[1];

  const lh3Match = str.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1]) return lh3Match[1];

  const genericDMatch = str.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (genericDMatch && genericDMatch[1]) return genericDMatch[1];

  return null;
};

/**
 * Get direct Google Drive thumbnail/view image URL
 */
export const getGoogleDriveDirectUrl = (fileId) => {
  if (!fileId) return FALLBACK_BOOK_COVER;
  return `https://lh3.googleusercontent.com/d/${fileId}`;
};

/**
 * Safely parse coverImage value (string or object) into a displayable image URL
 */
export const getCoverImageUrl = (coverImage) => {
  if (!coverImage) return FALLBACK_BOOK_COVER;

  if (typeof coverImage === 'string') {
    const trimmed = coverImage.trim();
    if (!trimmed) return FALLBACK_BOOK_COVER;

    const driveId = extractGoogleDriveFileId(trimmed);
    if (driveId && (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com'))) {
      return getGoogleDriveDirectUrl(driveId);
    }
    return trimmed;
  }

  if (typeof coverImage === 'object') {
    if (coverImage.url && typeof coverImage.url === 'string') {
      const driveId = extractGoogleDriveFileId(coverImage.url);
      if (driveId && (coverImage.url.includes('drive.google.com') || coverImage.url.includes('docs.google.com'))) {
        return getGoogleDriveDirectUrl(driveId);
      }
      return coverImage.url;
    }
    if (coverImage.fileId) {
      return getGoogleDriveDirectUrl(coverImage.fileId);
    }
  }

  return FALLBACK_BOOK_COVER;
};

/**
 * Format string/input into standard coverImage object structure
 */
export const formatCoverImageData = (inputUrl, customFileName = '') => {
  if (!inputUrl) return null;

  if (typeof inputUrl === 'object') return inputUrl;

  if (typeof inputUrl !== 'string') return null;
  const trimmed = inputUrl.trim();
  if (!trimmed) return null;

  // Base64 Data URL (Uploaded from Laptop)
  if (trimmed.startsWith('data:image/')) {
    return {
      type: 'file',
      fileName: customFileName || 'Laptop Uploaded Image',
      url: trimmed,
    };
  }

  // Extract real image URL from Google Search / Images links
  try {
    if (trimmed.includes('google.com') && (trimmed.includes('imgurl=') || trimmed.includes('imgres'))) {
      const urlObj = new URL(trimmed);
      const imgUrlParam = urlObj.searchParams.get('imgurl');
      if (imgUrlParam) {
        const decodedUrl = decodeURIComponent(imgUrlParam);
        return {
          type: 'url',
          url: decodedUrl,
        };
      }
    }
  } catch (e) {
    // Ignore URL parse errors
  }

  // Google Drive URL/ID check
  const driveFileId = extractGoogleDriveFileId(trimmed);
  if (
    driveFileId &&
    (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com') || !trimmed.includes('/'))
  ) {
    const directUrl = getGoogleDriveDirectUrl(driveFileId);
    return {
      type: 'google_drive',
      fileId: driveFileId,
      fileName: customFileName || `drive-cover-${driveFileId.substring(0, 6)}.jpg`,
      url: directUrl,
    };
  }

  return {
    type: 'url',
    url: trimmed,
  };
};

/**
 * Compress and convert local image file from laptop into lightweight Base64 Data URL
 */
export const processLocalImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file (PNG, JPG, WEBP, etc.)'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve({
          type: 'file',
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          url: compressedDataUrl,
        });
      };
      img.onerror = () => reject(new Error('Failed to read image file'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file from laptop'));
    reader.readAsDataURL(file);
  });
};

