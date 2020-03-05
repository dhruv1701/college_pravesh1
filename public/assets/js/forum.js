var newInput = () =>{
    var inp=document.getElementById("question-answer-container");
    var inp1 = document.createElement("INPUT");
    var label = document.createElement("LABEL");
    console.log(document.getElementById("user_name").innerHTML);
    label.innerHTML=document.getElementById("user_name").innerHTML;
    inp1.setAttribute("type", "text");
    inp.appendChild(label);
    inp.appendChild(inp1);
}