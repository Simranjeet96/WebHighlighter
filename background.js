chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.task=="add")
        {   
            localStorage.setItem(sender.tab.url+"!!"+request.seq,request.textString)
        }
        if(request.task=="delete")
        {
            localStorage.removeItem(sender.tab.url+"!!"+request.seq)
        }    
    }
    );