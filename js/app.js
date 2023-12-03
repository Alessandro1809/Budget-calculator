//Variables y seleccionadores
const formulario = document.querySelector("#agregar-gasto");
const gastoLista = document.querySelector("#gastos ul");

//Eventos
RegistrarEventos();

function RegistrarEventos() {
  document.addEventListener("DOMContentLoaded", preguntarPresupuesto);

  formulario.addEventListener("submit", agregarGasto);
}

//Clases

//una clase para el resupuesto y otra para la UI
class Controlapresupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto); //Number(variable) maneja tanto decimales como enteros y los pasa al tipo correspondiente
    this.restante = Number(presupuesto); //el mismo constructor se hace cargo de las dos propiedades
    this.gastos = []; //para ir agregando los gastos a la lista
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto];
    this.calculaElRestante();
  }

  calculaElRestante() {
    const presupuestoGastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );
    this.restante = this.presupuesto - presupuestoGastado;
  }
  eliminarGasto(id){
    this.gastos=this.gastos.filter(gasto=> gasto.id!==id);
    this.calculaElRestante();

  }
}

class UI {
  InsertarPresupuesto(cantidad) {
    //extraemos valor del objeto
    const { presupuesto, restante } = cantidad;
    //asignamos valor
    document.querySelector("#total").textContent = presupuesto;
    document.querySelector("#restante").textContent = restante;
  }

  mensajeDeError(mensaje, tipo) {
    //crear el div contenedor
    const div = document.createElement("DIV");
    div.classList.add("text-center", "alert");
    //validamos tipo de alerta
    if (tipo === "error") {
      div.classList.add("alert-danger");
    } else {
      div.classList.add("alert-success");
    }
    //asignamos texto
    div.textContent = mensaje;
    //agregamos al html

    document.querySelector(".primario").insertBefore(div, formulario);

    setTimeout(() => {
      div.remove();
    }, 3000);
  }
  agregaGastoALaLista(gasto) {
    this.limpiarHTML();
    //iterar sobre los gastos
    gasto.forEach((gasto) => {
      const { cantidad, nombre, id } = gasto;
      //Crear un li
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.dataset.id = id;
      //console.log(li)
      //agregar el HTML del gasto
      li.innerHTML = `
        ${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad}</span>

        `;
      // Boton para borrar gasto.
      const btnBorrar = document.createElement("button");
      btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
      btnBorrar.innerHTML = "Borrar &times";
        btnBorrar.onclick=()=>{
            borrarGasto(id);
        }

      li.appendChild(btnBorrar);
      //agregar en el documento

      gastoLista.appendChild(li);
    });
  }

  calculaElRestante(restante) {
    document.querySelector("#restante").textContent = restante;
  }

  compruebaElPresupuesto(presupuestoObj) {
    const { presupuesto, restante } = presupuestoObj;

    const restanteDIV = document.querySelector(".restante");
    //comprueba si se gasto el 75%
    if (presupuesto / 4 > restante) {
      restanteDIV.classList.remove("alert-success", "alert-warning");
      restanteDIV.classList.add("alert-danger");
    } else if (presupuesto / 2 > restante) {
      restanteDIV.classList.remove("alert-success");
      restanteDIV.classList.add("alert-warning");
    }else{
        restanteDIV.classList.remove("alert-danger", "alert-warning");
        restanteDIV.classList.add('alert-success');
    }

    //si el presupuesto llego a cero
    if (restante <= 0) {
      this.mensajeDeError("El presupuesto se ha agotado", "error");
      formulario.querySelector('button[type="submit"]').disabled = true;
    }
  }

  limpiarHTML() {
    while (gastoLista.firstChild) {
      gastoLista.removeChild(gastoLista.firstChild);
    }
  }
}

//instancias de las clases

let presupuesto;
const ui = new UI();

//funciones
function preguntarPresupuesto() {
  const presupuestoUsuario = prompt("Cual es tu presupuesto?");

  //validar presupuesto
  if (
    preguntarPresupuesto === "" ||
    preguntarPresupuesto === null ||
    isNaN(presupuestoUsuario) ||
    presupuestoUsuario <= 0
  ) {
    //isNaN evalua si es string, al convertirlo a numero da NaN y ejecuta el codigo del condicional
    window.location.reload(); //recarga la pagina hasta que la condicion se cumpla
  }
  //presupuesto valido
  presupuesto = new Controlapresupuesto(presupuestoUsuario);

  ui.InsertarPresupuesto(presupuesto);
}

function agregarGasto(e) {
  e.preventDefault();

  const nombre = document.querySelector("#gasto").value;
  const cantidad = Number(document.querySelector("#cantidad").value);

  if (nombre === "" || cantidad === "") {
    ui.mensajeDeError("Los dos campos son obligatorios", "error");
    return;
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.mensajeDeError("Cantidad no valida.", "error");
    return;
  }
  //generar objeto con el gasto
  const gasto = { nombre, cantidad, id: Date.now() }; //hace lo mismo que destructuring pero a la inversa

  presupuesto.nuevoGasto(gasto);
  //exito agregando
  ui.mensajeDeError("Gasto agregado!"); //no se le pasa tipo porque solo se evalua si es tipo errror de ser caso contrario va a la alerta de success
  const { gastos, restante } = presupuesto; //extraemos lo que necesitamos usar
  ui.agregaGastoALaLista(gastos);
  ui.calculaElRestante(restante);
  ui.compruebaElPresupuesto(presupuesto);

  formulario.reset();
}

function borrarGasto(id){
    //elimina del objeto
    presupuesto.eliminarGasto(id);
    //actualiza el hmtl
    const {gastos,restante}=presupuesto;
    ui.agregaGastoALaLista(gastos);

    ui.calculaElRestante(restante);
    ui.compruebaElPresupuesto(presupuesto);
}
