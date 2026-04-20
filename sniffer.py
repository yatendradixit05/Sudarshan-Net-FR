from scapy.all import sniff, wrpcap, IP, TCP, UDP
import datetime
import os
import time
import json
from threading import Thread

# --- Configuration ---
STORAGE_DIR = "packets"
METADATA_FILE = "network_log.json"
CHUNK_DURATION = 300  # 5 minutes
MAX_FILES = 12        # Keep 1 hour of PCAPs

if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)

current_packets = []

# --- Background Task: Save PCAP Chunks ---
def save_chunk():
    global current_packets
    while True:
        time.sleep(CHUNK_DURATION)
        if current_packets:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{STORAGE_DIR}/traffic_{timestamp}.pcap"
            wrpcap(filename, current_packets)
            print(f"\n[SYSTEM] Saved PCAP chunk: {filename}")
            current_packets = []
            cleanup_old_files()

def cleanup_old_files():
    files = sorted([f for f in os.listdir(STORAGE_DIR) if f.endswith(".pcap")])
    while len(files) > MAX_FILES:
        file_to_del = os.path.join(STORAGE_DIR, files.pop(0))
        os.remove(file_to_del)
        print(f"[SYSTEM] Deleted old record: {file_to_del}")

# --- Core Logic: Process Every Packet ---
def process_packet(packet):
    global current_packets
    if IP in packet:
        # 1. Add to the PCAP buffer (The "Raw Tape")
        current_packets.append(packet)
        
        # 2. Create Metadata Entry (The "Searchable Index")
        entry = {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "src": packet[IP].src,
            "dst": packet[IP].dst,
            "proto": packet[IP].proto,
            "size": len(packet)
        }

        # 3. Append to JSON log file
        with open(METADATA_FILE, "a") as f:
            f.write(json.dumps(entry) + "\n")
        
        # Visual feedback that it's working
        print(".", end="", flush=True)

# --- Start the Engine ---
recorder_thread = Thread(target=save_chunk, daemon=True)
recorder_thread.start()

print(f"--- Flight Recorder: ACTIVE ---")
print(f"Logging metadata to: {METADATA_FILE}")
print(f"Recording PCAPs to: /{STORAGE_DIR}")

try:
    # Sniffing on all interfaces
    sniff(prn=process_packet, store=0)
except KeyboardInterrupt:
    print("\n[SYSTEM] Stopped by user.")
