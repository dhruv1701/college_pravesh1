var x=0;
var newInput = () =>{
    var inp=document.getElementById("question-answer-container");
    var inp1 = document.createElement("INPUT");
    var label = document.createElement("INPUT");
    var button = document.createElement("BUTTON");
    //console.log(document.getElementById("user_name").innerHTML);
    label.setAttribute("type","text");
    label.style.width ="180px";
    label.placeholder= "enter your name";
    button.innerHTML="SUBMIT";
    inp1.setAttribute("type", "text");
    
    button.onclick = ()=>{
        console.log("hell0o");
        var inputx=$("#input"+x+"").val();
        var labelx=$("#label"+x+"").val();
        var element = document.getElementById("submit"+x);
        inp1.readOnly = true;
        label.readOnly = true;
        button.remove();
        $.post("http://localhost:8080/login",{username: labelx,data: inputx},function(data){
            if(data=="accepted")
            {
                // var element = document.getElementById("submit"+x+"");
                // document.getElementById("input"+x+"").readOnly = true;
                // element.parentNode.removeChild(element);
            }
        });
    }

    inp.appendChild(label);
    inp.appendChild(inp1);
    inp.appendChild(button);
}
