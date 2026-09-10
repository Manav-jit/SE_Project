import pandas as pd
import os
import urllib.request

def download_malware_dataset():
    # URL to a well-known public API Sequence Malware Dataset on GitHub
    # Repository: mpasco/MalbehavD-V1
    url = "https://raw.githubusercontent.com/mpasco/MalbehavD-V1/master/MalBehavD-V1-dataset.csv"
    output_file = "real_malware_dataset.csv"
    
    print(f"Downloading real malware dataset from GitHub...")
    print(f"URL: {url}")
    
    urllib.request.urlretrieve(url, output_file)
    
    print(f"Download complete! Saved to {output_file}")
    print("-" * 50)
    
    # Load and show a preview
    df = pd.read_csv(output_file)
    print(f"Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print("\nColumns:")
    print("1. 'sha256' : The file hash of the executable")
    print("2. 'labels' : The security state (0 = Benign/Trusted, 1 = Malware/Denied)")
    print("3. '0', '1', '2'... : These represent the sequence of Windows API calls made by the executable")
    
    print("\nPreview of the first 3 rows:")
    print(df[['sha256', 'labels', '0', '1', '2', '3']].head(3))
    print("\n" + "="*50)
    print("To use this data in our AI Service, we will need to update our model to train on 'API call sequences'")
    print("rather than just 'Origin' and 'Operation', and our Rust kernel will need to send these API sequences.")

if __name__ == '__main__':
    download_malware_dataset()
