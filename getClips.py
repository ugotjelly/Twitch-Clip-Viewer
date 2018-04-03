
import requests
import base64

headers = { "Host": "api.twitch.tv",
"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:51.0) Gecko/20100101 Firefox/51.0",
"Accept": "application/vnd.twitchtv.v4+json",
"Accept-Language": "en-US,en;q=0.5",
"Accept-Encoding": "gzip, deflate, br",
"Client-ID": "jzkbprff40iqj646a697cyrvl0zt2m6",
"If-Modified-Since": "*",
"X-CSRF-Token": "SCIVnhlganDAhmNpS35cot9ppjhCZe9Hf/0+PIMtVho=",
"X-Requested-With": "XMLHttpRequest"}
   
def get_proxies():
    lines = [line.rstrip("\n") for line in open("../freeproxy_9896982925.txt")]
    return lines

    
if __name__ == "__main__":
   
    INDEX = 0
    #CHANNEL = "ruben_sole"
    print("Welcome to clip grabber")
    CHANNEL = input("Please enter a channel: ")
    
    response = requests.get("https://api.twitch.tv/kraken/users/" + CHANNEL, headers={"Client-ID": "jzkbprff40iqj646a697cyrvl0zt2m6"})
    if response.status_code == 404:
        print("Channel not found")
        exit(0)
        
    #print(response.status_code)
    #exit(1)
    
    if INDEX == 0:
        f = open(CHANNEL + "_clips.txt", 'w', encoding='utf-8')
    else: 
        f = open(CHANNEL + "_clips.txt", 'a', encoding='utf-8')
    offSet = 0
    proxy_list = get_proxies()
        
    while True:
    
        #print(str(INDEX).encode('utf-8'))
        
        proxy = {"http": proxy_list[offSet]}
        POS = base64.b64encode(str(INDEX).encode('utf-8'))
        URL = "https://api.twitch.tv/kraken/clips/top?channel=" + CHANNEL + "&cursor=" + str(POS.decode()) + "&limit=100&period=all&on_site=1"
        print(URL)
        
        try:
            r = requests.get(URL, headers=headers, proxies=proxy)
            
            if("Internal Server Error" in r.text):
                continue
            elif('{"clips":[],"_cursor":""}' in r.text):
                print("Job done.")
                break
            
            print("Page " + str(int(INDEX/100)) + ": " + str(r.text.encode('utf-8')[:200]) + "...")
        
            if(int(INDEX) < 100):
                f.write(r.text[:r.text.rfind(']')])
            else:
                f.write(",")
                f.write(r.text[10:r.text.rfind(']')])
            #f.write("\n")
            
            INDEX += 100
            offSet += 1
        except requests.exceptions.Timeout:
            pass
            print ("  Timeout error for %s" % proxy["http"])
        except requests.exceptions.ConnectionError:
            pass
            print ("  Connection error for %s" % proxy["http"])
        except:
            pass
            print(" Proxy error " + proxy["http"])
            
    f.write(']}')
    f.close()
