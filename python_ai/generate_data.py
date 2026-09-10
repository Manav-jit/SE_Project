import pandas as pd
import numpy as np
import random

def generate_data(num_samples=2000):
    origins = ['Browser Download', 'Malware Drop', 'System Update', 'User File', 'Unknown Network']
    operations = ['Read', 'Write', 'Execute']
    extensions = ['.exe', '.dll', '.sys', '.sh', '.txt', '.pdf']
    
    data = []
    
    for _ in range(num_samples):
        origin = random.choice(origins)
        operation = random.choice(operations)
        extension = random.choice(extensions)
        creator_pid = random.randint(100, 9999)
        
        # Simple heuristic to simulate labels
        if origin == 'Malware Drop' or origin == 'Unknown Network':
            if extension in ['.exe', '.dll', '.sys'] and operation == 'Execute':
                label = 'Denied'
            else:
                label = 'Restricted'
        elif origin == 'Browser Download':
            if extension in ['.exe', '.sh'] and operation == 'Execute':
                label = 'Restricted' # Can't execute directly from browser drop
            else:
                label = 'Trusted'
        else: # System Update, User File
            label = 'Trusted'
            
        # Add some noise
        if random.random() < 0.05:
            label = random.choice(['Trusted', 'Restricted', 'Denied'])
            
        data.append({
            'origin': origin,
            'operation': operation,
            'extension': extension,
            'creator_pid': creator_pid,
            'label': label
        })
        
    df = pd.DataFrame(data)
    df.to_csv('dataset.csv', index=False)
    print(f"Generated dataset.csv with {num_samples} samples.")

if __name__ == '__main__':
    generate_data()
