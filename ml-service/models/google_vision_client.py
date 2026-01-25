
import os
try:
    from google.cloud import vision
except ImportError:
    vision = None

class GoogleVisionClient:
    def __init__(self, credential_path="credentials.json"):
        self.client = None
        self.enabled = False
        
        # Cek apakah library terinstall
        if vision is None:
            print("WARNING: google-cloud-vision not installed.")
            return

        # Cek apakah file credential ada
        if os.path.exists(credential_path):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credential_path
            try:
                self.client = vision.ImageAnnotatorClient()
                self.enabled = True
                print("SUCCESS: Google Cloud Vision API initialized!")
            except Exception as e:
                print(f"ERROR: Failed to init Google Vision: {e}")
        else:
            print(f"INFO: No Google Cloud credentials found at {credential_path}. Using local AI.")

    def analyze_image(self, img_content):
        """
        img_content: Binary image data
        Returns: { 'labels': ['Cow', 'Grass'], 'text': '...', 'safe_search': ... }
        """
        if not self.enabled or not self.client:
            return None

        try:
            image = vision.Image(content=img_content)
            
            # Request fitur: Label (Objek) dan Text (Merek/Warna)
            response = self.client.label_detection(image=image)
            labels = [label.description for label in response.label_annotations]
            
            # Deteksi warna dominan
            props = self.client.image_properties(image=image)
            colors = props.image_properties_annotation.dominant_colors.colors
            dominant_color = "Unknown"
            if colors:
                # Ambil warna paling dominan (score tertinggi)
                # Sort by pixel_fraction
                sorted_colors = sorted(colors, key=lambda c: c.pixel_fraction, reverse=True)
                c = sorted_colors[0].color
                dominant_color = f"RGB({int(c.red)},{int(c.green)},{int(c.blue)})"

            return {
                'success': True,
                'source': 'Google Cloud Vision',
                'labels': labels, # e.g. ['Cattle', 'Working animal', 'Grass']
                'color': dominant_color,
                'raw_response': str(response)
            }
        except Exception as e:
            print(f"Google Vision API Error: {e}")
            return None
