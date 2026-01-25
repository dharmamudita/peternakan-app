import numpy as np
import requests
from PIL import Image
from io import BytesIO
from skimage import color, feature
from skimage.transform import resize, hough_line, hough_line_peaks
from skimage.feature import canny
from skimage.measure import shannon_entropy
from skimage.color import rgb2gray, rgb2hsv
import urllib3
import logging

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class ProductAnalyzer:
    def __init__(self):
        pass

    def find_matches(self, query_img_array, candidates):
        """
        Mencari produk yang mirip secara visual.
        """
        logging.info(f"Start finding matches for {len(candidates)} candidates")

        # Helper: Generate Histogram
        def get_histogram(img_arr):
            try:
                # Resize
                img_small = resize(img_arr, (64, 64), anti_aliasing=True)
                if img_small.shape[-1] == 4: img_small = img_small[:,:,:3] # Remove Alpha
                img_hsv = rgb2hsv(img_small)
                
                h_hist, _ = np.histogram(img_hsv[:,:,0], bins=8, range=(0, 1))
                s_hist, _ = np.histogram(img_hsv[:,:,1], bins=4, range=(0, 1))
                v_hist, _ = np.histogram(img_hsv[:,:,2], bins=4, range=(0, 1))
                
                hist = np.concatenate([h_hist, s_hist, v_hist]).astype(np.float32)
                hist = hist / (hist.sum() + 1e-5)
                return hist
            except Exception as e:
                logging.error(f"Hist Error: {e}")
                return None

        # 1. Proses Query Image
        query_hist = get_histogram(query_img_array)
        if query_hist is None: return []

        matches = []
        
        # 2. Loop Candidates
        for item in candidates:
            try:
                url = item.get('image_url')
                if not url: continue
                
                # Fix Localhost
                if 'localhost' in url and '127.0.0.1' not in url:
                    url = url.replace('localhost', '127.0.0.1')
                
                # Handling Backslash (Windows Path Fix)
                url = url.replace('\\', '/')

                logging.debug(f"Downloading: {url}")

                # Download dengan Requests
                try:
                    headers = {'User-Agent': 'Mozilla/5.0'}
                    dl_url = url.replace('localhost', '127.0.0.1')
                    
                    response = requests.get(dl_url, timeout=5, headers=headers, verify=False)
                    
                    if response.status_code != 200: 
                        logging.warning(f"Download failed: {dl_url} status {response.status_code}")
                        continue
                    
                    # Buka dengan PIL
                    img_pil = Image.open(BytesIO(response.content)).convert('RGB')
                    img_cand = np.array(img_pil)
                    
                    # 1. HISTOGRAM MATCHING
                    cand_hist = get_histogram(img_cand)
                    if cand_hist is None: continue
                    hist_dist = np.linalg.norm(query_hist - cand_hist)
                    score_hist = max(0, 100 - (hist_dist * 50))
                    
                    # 2. PIXEL MSE MATCHING (32x32)
                    q_small = resize(query_img_array, (32, 32), anti_aliasing=True)
                    c_small = resize(img_cand, (32, 32), anti_aliasing=True)
                    mse = np.mean((q_small - c_small) ** 2)
                    score_mse = max(0, 100 - (mse * 500)) 
                    
                    # FINAL SCORE
                    final_score = (score_mse * 0.7) + (score_hist * 0.3)
                    
                    logging.info(f"ID {item['id']} -> MSE={score_mse:.1f}, Hist={score_hist:.1f}, Final={final_score:.1f}")

                    if final_score > 10: # ALMOST ANY SIMILARITY OK
                        matches.append({'id': item['id'], 'score': final_score})
                        
                except Exception as down_err:
                    logging.error(f"Exception downloading {url}: {down_err}")
                    continue
                    
            except Exception as e:
                continue
        
        matches.sort(key=lambda x: x['score'], reverse=True)
        logging.info(f"Found {len(matches)} matches")
        return matches[:10]

    def analyze(self, img_array):
        """
        Menganalisis gambar.
        """
        try:
            logging.info("Analyzing generic features...")
            img_resized = resize(img_array, (200, 200), anti_aliasing=True)
            gray_img = rgb2gray(img_resized)
            
            color_res = self._detect_dominant_color(img_resized)
            color_name = color_res['name']
            is_green = color_res['is_green']
            
            is_man_made = self._check_man_made_features(gray_img)
            entropy_val = shannon_entropy(gray_img)
            
            logging.info(f"Features: ManMade={is_man_made}, Green={is_green}, Ent={entropy_val:.2f}, Col={color_name}")

            category = "Umum"
            
            if is_man_made:
                if entropy_val < 5.0 or color_name == "Putih":
                    category = "Obat" 
                else:
                    category = "Alat" 
            else:
                if entropy_val > 6.8:
                    category = "Kambing" 
                elif entropy_val > 5.0:
                    category = "Sapi" 
                elif is_green:
                    category = "Sapi" # Favor Sapi over Pakan
                else:
                    if color_name in ["Coklat", "Kuning"]: category = "Pakan"
                    else: category = "Ayam"

            keywords = f"{category} {color_name}"
            
            return {
                'success': True,
                'search_query': keywords,
                'detected_features': {
                    'category': category,
                    'color': color_name,
                    'is_man_made': is_man_made
                }
            }
        except Exception as e:
            logging.error(f"Analysis error: {e}")
            print(f"Product Analysis Error: {e}")
            return {'success': False, 'error': str(e)}

    def _check_man_made_features(self, gray_image):
        edges = canny(gray_image, sigma=2.0)
        tested_angles = np.linspace(-np.pi / 2, np.pi / 2, 360, endpoint=False)
        h, theta, d = hough_line(edges, theta=tested_angles)
        peaks = hough_line_peaks(h, theta, d, num_peaks=10, threshold=0.3*np.max(h))
        num_lines = len(peaks[0])
        return num_lines >= 3

    def _detect_dominant_color(self, img):
        hsv = color.rgb2hsv(img)
        h_mean = np.mean(hsv[:,:,0])
        s_mean = np.mean(hsv[:,:,1])
        v_mean = np.mean(hsv[:,:,2])
        
        is_green = (0.2 < h_mean < 0.45) and (s_mean > 0.3)
        
        name = "Umum"
        if s_mean < 0.15 and v_mean > 0.7: name = "Putih"
        elif v_mean < 0.25: name = "Hitam"
        elif is_green: name = "Hijau"
        elif (h_mean < 0.12 or h_mean > 0.9) and s_mean > 0.3: name = "Coklat"
        elif 0.12 <= h_mean < 0.2: name = "Kuning"
        elif 0.5 < h_mean < 0.7: name = "Biru"
        else: name = "Abu-abu"
        
        return {'name': name, 'is_green': is_green}
