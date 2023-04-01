const urlapi = "https://jsonplaceholder.typicode.com";
fetch(`${urlapi}/users`)
.then(response => response.json())
.then(user=>{
    const adreess = user.map(key=>key.address);
    const geo = adreess.map(key=>key.geo);
    const coorx = geo.map(key=>key.lng);
    const coory = geo.map(key => key.lat)
    console.log(geo);
    console.log(coorx); 
    console.log(coory);
});

//promesas 
function cuadradopromises(value){
    if(typeof(value) != "number"){
        return new Promise.reject("Error" + value.toString() + "no es un numero")
    }
    else{
   return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve({
                value:value,
                result: value**value
            });
        },0|Math.random()*1000)
    })}
};

cuadradopromises(0)
.then(obj=>{
    console.log("Iniciando promesa");
    return cuadradopromises(1)})
.then(obj=>{
    console.log("Valor de 2");
    return cuadradopromises(2)})
.then(obj=>{
    console.log("Valor de 3");
    return cuadradopromises(4)}) 
.then(obj=>{
    console.log("Valor de 4");
    return cuadradopromises(8)})
.then(obj=>{
    console.log("final de la promesa")
})
.catch(err=>console.error(err));
//1,2,3,4,5,6,7,8,9,+,-,*,/

const numeros = (value)=>{
    return typeof(value) === 'number'
}
const signo = (value)=>{
    return value === "+" || value === "-" || value === "*" || value === "/"
}

let esnumero = numeros("w") && signo("+") ? "Se puede darle un stilo css": "No se le asignara nada";
console.log(esnumero);

