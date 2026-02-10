/**
 * Attempts to get the local IP using WebRTC.
 * 
 * Strategy:
 * 1. Try normally. Modern browsers return mDNS (obfuscated) or nothing.
 * 2. If 'usePermission' is true, we request Microhone access briefly.
 *    This signals 'trust' to the browser, which often (but not always) 
 *    unmasks the Host Candidates in WebRTC, revealing the actual LAN IP.
 */
export const getLocalIp = async (usePermission: boolean = false): Promise<string> => {
  let stream: MediaStream | null = null;

  try {
    if (usePermission) {
      try {
        // Requesting audio permission is a known method to unmask local IPs in Chrome/Edge
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.warn("Permission denied for IP discovery:", err);
        return "Permission Denied";
      }
    }

    return await new Promise<string>((resolve) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        
        // Cleanup helper to stop tracks and close connection
        const cleanup = () => {
          pc.onicecandidate = null;
          pc.close();
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        };

        pc.createDataChannel('');
        
        pc.createOffer()
          .then((sdp) => pc.setLocalDescription(sdp))
          .catch(() => {
             cleanup();
             resolve("Unavailable");
          });

        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;

          const candidate = ice.candidate.candidate;
          
          // Regex to capture IPv4 
          const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(candidate);

          if (myIP) {
            // We found a real IP
            cleanup();
            resolve(myIP[1]);
          } else if (candidate.includes('.local') && !usePermission) {
            // We found an mDNS candidate and we haven't asked for permission yet.
            // Stop early and report "Hidden" so UI can prompt user.
            cleanup();
            resolve("Hidden by Browser");
          }
        };

        // Timeout
        setTimeout(() => {
          cleanup();
          // If we used permission and still got nothing, it's truly not found
          resolve(usePermission ? "Not Found" : "Hidden by Browser");
        }, 1500);

      } catch (e) {
        if (stream) stream.getTracks().forEach(track => track.stop());
        resolve("Unavailable");
      }
    });
  } catch (e) {
    return "Error";
  }
};

/**
 * Gets the public IP from a reliable echo service.
 */
export const getPublicIp = async (): Promise<string> => {
  if (!navigator.onLine) {
    return "Offline";
  }
  
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to fetch public IP", error);
    return "Unavailable";
  }
};