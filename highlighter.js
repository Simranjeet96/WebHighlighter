htmlString=`
<div id="contextMenu" class="context-menu">
    <ul class="list-item__parent">
        <li id="option1">Highlight</li>
        <li id="option2">Google Search</li>
    </ul>
</div>
<div id="contextMenu2" class="context-menu">
    <ul class="list-item__parent">
        <li id="option3">delete Highlight</li>
    </ul>
</div>
`
//above html string is custom context menu
document.body.insertAdjacentHTML("beforeend",htmlString)
deleted=true;
/*
// this global variable is used to check if last highlight that got selected for deletion via context menu was deleted or not.
For example user may right click on the highlighted line to delete it , which will cause color change to red while it was selected 
but the user doesnot click on delete option so this variable will help us to know if highlight got deleted or not as when
delete function will trigger, it will set deleted to true to let us know else we have to restore
the highlight color back to normal highlight color
*/
function siblingPosition(node) {
    var i = 1;
    while(node = node.previousElementSibling) {
        i+= 1;
    }
    return i;
}
function getQuerySelector(node) {
    if(node.id) return "#" + node.id;
    if(node.nodeName == "BODY") return "body";
    var position = siblingPosition(node);
    return getQuerySelector(node.parentNode) + ">:nth-child("+ position +")";
}

function nodeIndex(node){
    var i = 0;
    while( node = node.previousSibling ) 
      {i++;}
      return i;
}


function nativeTreeWalker(startNode,endNode) {
    var walker = document.createTreeWalker(
        document.body, 
        NodeFilter.SHOW_TEXT);

        var node;
        textNodes = [];
        while(node=walker.nextNode()){
            if (node===startNode){
            while(node!==endNode){
                if (node!=null && node!=undefined && node.nodeValue && node.nodeValue.trim()!=""){
                    textNodes.push(node);
                }
                node=walker.nextNode();
            }
            textNodes.push(node);

            return;
        }
    }
}
function highlightToggleAllSpanTagsWithSameCls(event){//contextmenu event
        if (deleted==false){
            spanTagsWithSameClass=document.getElementsByClassName(msg);
            for(x of spanTagsWithSameClass ){
                x.setAttribute("style","background-color:#ACCEF7");
            }
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        msg=event.target.getAttribute("class");
        spanTagsWithSameClass=document.getElementsByClassName(msg);
        for(x of spanTagsWithSameClass ){
            x.setAttribute("style","background-color:#ee6d6d");
        }
        deleted=false;
        showContextMenu2(event);
}

function deleteHighlighted(event){//click event
    deleted=true;
    for(x of spanTagsWithSameClass ){
        x.setAttribute("style","background-color:transparent");
        x.removeEventListener("contextmenu",highlightToggleAllSpanTagsWithSameCls);
    }
    // and remove tags from local storage now
    tempDict=JSON.parse(window.localStorage.getItem(urlPath+"!!"+msg))
    tempDict.toNotBeHighlighted=true;
    window.localStorage.setItem(urlPath+"!!"+msg,JSON.stringify(tempDict));
    chrome.runtime.sendMessage({task: "delete",seq:msg});
}

urlOrigin=window.location.origin
urlPath=window.location.pathname
function generateNextSequence(){
    let seq = window.localStorage.getItem("counter");
    if (seq == null) {
        window.localStorage.setItem("counter", "1");
        sequence="0";
        return;
    }
    temp=parseInt(seq) + 1;
    window.localStorage.setItem("counter",temp.toString() );
    sequence=seq;
}

function processTextNodes(textNodes,startNode,endNode,startNodeHighlightPos,endNodeHighlightPos,restoring=false){
    if (restoring==true){
        sequence=SEQUENCE;
        if(toNotBeHighlighted){
           color="transparent"; 
        }else{
            color="#ACCEF7"
        }
    }
    else{
        toNotBeHighlighted=false;
        color="#ACCEF7"
    }
    if (startNode===endNode){
        spanTag=document.createElement("span");
        spanTag.setAttribute("style","background-color:"+color);
        if(!toNotBeHighlighted)spanTag.addEventListener("contextmenu",highlightToggleAllSpanTagsWithSameCls);
        spanTag.setAttribute("class",sequence );
        spanTag.appendChild(document.createTextNode(textNodes[0].nodeValue.substring(startNodeHighlightPos,endNodeHighlightPos)));
        beforeSpanTag=null;
        afterSpanTag=null;
        if (startNodeHighlightPos>0){
            beforeSpanTag=document.createTextNode(textNodes[0].nodeValue.substring(0,startNodeHighlightPos));
        }
        if (endNodeHighlightPos<textNodes[0].length){
            afterSpanTag=document.createTextNode(textNodes[0].nodeValue.substring(endNodeHighlightPos));
        }
        if (beforeSpanTag){
            textNodes[0].parentNode.insertBefore(beforeSpanTag,textNodes[0]);
        }
        textNodes[0].parentNode.insertBefore(spanTag,textNodes[0]);
        if (afterSpanTag){
            textNodes[0].parentNode.insertBefore(afterSpanTag,textNodes[0]);
        }
        textNodes[0].remove();
        return;
    }
    
    spanTag=document.createElement("span");
    spanTag.setAttribute("style","background-color:"+color);
    if(toNotBeHighlighted!=true)spanTag.addEventListener("contextmenu",highlightToggleAllSpanTagsWithSameCls);
    spanTag.setAttribute("class",sequence )
    spanTag.appendChild(document.createTextNode(textNodes[0].nodeValue.substring(startNodeHighlightPos)));
    beforeSpanTag=document.createTextNode(textNodes[0].nodeValue.substring(0,startNodeHighlightPos));
    textNodes[0].parentNode.insertBefore(beforeSpanTag,textNodes[0]);
    textNodes[0].parentNode.insertBefore(spanTag,textNodes[0]);
    for (i = 1, len = textNodes.length-1 ; i < len; i++) {
        spanTag=document.createElement("span");
        spanTag.setAttribute("style","background-color:"+color);
        if(toNotBeHighlighted!=true)spanTag.addEventListener("contextmenu",highlightToggleAllSpanTagsWithSameCls);
        spanTag.setAttribute("class",sequence )
        spanTag.appendChild(document.createTextNode(textNodes[i].nodeValue));
        textNodes[i].parentNode.insertBefore(spanTag,textNodes[i]);
    }
    if(textNodes.length>1){
        spanTag=document.createElement("span");
        spanTag.setAttribute("style","background-color:"+color);
        if(toNotBeHighlighted!=true)spanTag.addEventListener("contextmenu",highlightToggleAllSpanTagsWithSameCls);
        spanTag.setAttribute("class",sequence )
        spanTag.appendChild(document.createTextNode(textNodes[textNodes.length-1].nodeValue.substring(0,endNodeHighlightPos)));
        afterSpanTag=document.createTextNode(textNodes[textNodes.length-1].nodeValue.substring(endNodeHighlightPos));
        textNodes[textNodes.length-1].parentNode.insertBefore(spanTag,textNodes[textNodes.length-1]);
        textNodes[textNodes.length-1].parentNode.insertBefore(afterSpanTag,textNodes[textNodes.length-1]);
    }
   for (i=0;i<textNodes.length;i++)
    {textNodes[i].remove();}
}
    
function save(startNodeSavedParent,endNodeSavedParent,startNodeIndex,endNodeIndex){
    dict={
        "QSSN":getQuerySelector(startNodeSavedParent),
        "QSEN":getQuerySelector(endNodeSavedParent),
        "SNHP":startNodeHighlightPos,
        "ENHP":endNodeHighlightPos,
        "SNINDEX":startNodeIndex,
        "ENINDEX":endNodeIndex,
        "toNotBeHighlighted":false
    };
    window.localStorage.setItem(urlPath+"!!"+sequence,JSON.stringify(dict));
}


function addHighlight(){
    generateNextSequence();
    if (startNode.compareDocumentPosition(endNode)==2){
        temp=startNode;
        startNode=endNode;
        endNode=temp;
        temp=startNodeHighlightPos;
        startNodeHighlightPos=endNodeHighlightPos;
        endNodeHighlightPos=temp;
    }
    if (startNode.compareDocumentPosition(endNode)==0 && startNodeHighlightPos>endNodeHighlightPos){
        temp=startNodeHighlightPos;
        startNodeHighlightPos=endNodeHighlightPos;
        endNodeHighlightPos=temp;
    }
    sel.collapse(null);
    if(startNode){
        nativeTreeWalker(startNode,endNode);
    }
    startNodeSavedParent=startNode.parentElement
    endNodeSavedParent=endNode.parentElement
    startNodeIndex=nodeIndex(startNode)
    endNodeIndex=nodeIndex(endNode)
    let range = new Range();
    range.setStart(startNode, startNodeHighlightPos);
    range.setEnd(endNode,endNodeHighlightPos);
    let text = range.toString();
    chrome.runtime.sendMessage({task: "add",textString:text,seq:sequence});
    processTextNodes(textNodes,startNode,endNode,startNodeHighlightPos,endNodeHighlightPos);
    save(startNodeSavedParent,endNodeSavedParent,startNodeIndex,endNodeIndex);

}

var contextMenu = document.getElementById('contextMenu');
var contextMenu2=document.getElementById('contextMenu2');
function showContextMenu (event) {
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
}
function hideContextMenu () {
    contextMenu.style.display = 'none';
}
function showContextMenu2 (event) {
    contextMenu2.style.display = 'block';
    contextMenu2.style.left = event.pageX + 'px';
    contextMenu2.style.top = event.pageY + 'px';
}
function hideContextMenu2 () {
    contextMenu2.style.display = 'none';
    if (typeof deleted !== 'undefined' && deleted == false){
        for(x of spanTagsWithSameClass ){
            x.setAttribute("style","background-color:#ACCEF7");
        }
        deleted=true;
    }
}

function main(event){
    sel=window.getSelection();
    if (sel.isCollapsed){
        return true;
    }
    event.preventDefault();
    startNode=sel.anchorNode;
    startNodeHighlightPos=sel.anchorOffset;
    endNodeHighlightPos=sel.focusOffset;
    endNode=sel.focusNode;
    showContextMenu(event);
}

window.addEventListener("contextmenu",main);
window.addEventListener("click",hideContextMenu);
window.addEventListener("click",hideContextMenu2);

function GoogleSearch(event){
    if (startNode.compareDocumentPosition(endNode)==2){
        temp=startNode;
        startNode=endNode;
        endNode=temp;
        temp=startNodeHighlightPos;
        startNodeHighlightPos=endNodeHighlightPos;
        endNodeHighlightPos=temp;
    }
    if (startNode.compareDocumentPosition(endNode)==0 && startNodeHighlightPos>endNodeHighlightPos){
        temp=startNodeHighlightPos;
        startNodeHighlightPos=endNodeHighlightPos;
        endNodeHighlightPos=temp;
    }
    let range = new Range();
    range.setStart(startNode, startNodeHighlightPos);
    range.setEnd(endNode,endNodeHighlightPos);
    text = range.toString();
    window.open(`https://www.google.com/search?q=${text}`);
}

document.getElementById("option1").addEventListener("click",addHighlight);
document.getElementById("option2").addEventListener("click",GoogleSearch);
document.getElementById("option3").addEventListener("click",deleteHighlighted);


function restoreHighlights(){
    keys_ = Object.keys(localStorage).sort();
    for(key of keys_){
        if (key.split("!!")[0]==urlPath){
            obj=localStorage.getItem(key);
            obj=JSON.parse(obj);
            startNodeParentElement=document.querySelector(obj.QSSN);
            endNodeParentElement=document.querySelector(obj.QSEN);
            SEQUENCE=key.split("!!")[1];
            startNode=startNodeParentElement.childNodes[obj.SNINDEX];
            endNode=endNodeParentElement.childNodes[obj.ENINDEX];
            startNodeHighlightPos=obj.SNHP;
            endNodeHighlightPos=obj.ENHP;
            toNotBeHighlighted=obj.toNotBeHighlighted;
            nativeTreeWalker(startNode,endNode);
            processTextNodes(textNodes,startNode,endNode,startNodeHighlightPos,endNodeHighlightPos,true);
        }
    }
}
restoreHighlights();
