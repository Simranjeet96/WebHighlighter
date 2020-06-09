function wrapper(url){
    return function(){window.open(url);}
}
ul=document.createElement("ul")
ul.setAttribute("class","list-item__parent")
for (key of Object.keys(localStorage)){
    li=document.createElement("li")
    li.appendChild(document.createTextNode(localStorage.getItem(key)))
    li.appendChild(document.createElement("br"))
    li.appendChild(document.createTextNode(key.split("!!")[0]))
    li.addEventListener("click",wrapper(key.split("!!")[0]))
    li2=document.createElement("li")
    li2.setAttribute("class","seperator")
    ul.appendChild(li)
    ul.appendChild(li2)

}
document.body.appendChild(ul)
