
/* minimal CSInterface loader */
function CSInterface(){
    this.evalScript=function(script){
        if(window.__adobe_cep__){
            window.__adobe_cep__.evalScript(script);
        }else{
            alert("CEP not available");
        }
    }
}
