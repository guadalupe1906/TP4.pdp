const prompt = require("prompt-sync")();

// ==================== MODELO INMUTABLE ====================

const crearTarea = (titulo, descripcion = "", estado = "pendiente", dificultad = "fácil", vencimiento = null) => 
  Object.freeze({
    titulo,
    descripcion,
    estado,
    dificultad,
    creacion: new Date().toISOString().split("T")[0],
    ultimaEdicion: new Date().toISOString().split("T")[0],
    vencimiento,
  });

// ==================== FUNCIONES PURAS ====================

//  Agregar tarea
const agregarTarea = (lista, tarea) => Object.freeze([...lista, tarea]);

//  Buscar tarea por título
const buscarTareaPorTitulo = (lista, titulo) =>
  lista.find(t => t.titulo.toLowerCase().trim() === titulo.toLowerCase().trim());

//  Filtrar por estado
const filtrarPorEstado = (lista, estado) =>
  lista.filter(t => t.estado.toLowerCase() === estado.toLowerCase());

//  Actualizar una tarea (sin mutar)
const actualizarTarea = (lista, titulo, cambios) =>
  lista.map(t => 
    t.titulo === titulo 
      ? Object.freeze({ 
          ...t, 
          ...cambios, 
          ultimaEdicion: new Date().toISOString().split("T")[0] 
        })
      : t
  );

//  Mostrar lista de títulos (sin efectos)
const obtenerTitulos = lista => lista.map((t, i) => `[${i + 1}] ${t.titulo}`);

//  Ordenar por vencimiento (función pura)
const ordenarPorVencimiento = lista => 
  [...lista].sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento));

// ==================== VALIDACIONES (semi-puras: dependen de input) ====================

const validarEstado = () => {
  const estadosValidos = ["pendiente", "en curso", "terminada", "cancelada"];
  let estado;
  do {
    estado = prompt("Estado (pendiente / en curso / terminada / cancelada): ").toLowerCase();
    if (!estadosValidos.includes(estado)) console.log("Estado inválido. Intenta nuevamente.");
  } while (!estadosValidos.includes(estado));
  return estado;
};

const validarDificultad = () => {
  const dificultadesValidas = ["fácil", "medio", "difícil"];
  let dificultad;
  do {
    dificultad = prompt("Dificultad (fácil / medio / difícil): ").toLowerCase();
    if (!dificultadesValidas.includes(dificultad)) console.log("Dificultad inválida. Intenta nuevamente.");
  } while (!dificultadesValidas.includes(dificultad));
  return dificultad;
};

const validarFecha = () => {
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  let fecha;
  do {
    fecha = prompt("Fecha de vencimiento (YYYY-MM-DD): ");
    if (!regexFecha.test(fecha)) {
      console.log("Formato inválido.");
      fecha = null;
    } else {
      const hoy = new Date();
      const ingresada = new Date(fecha);
      if (isNaN(ingresada.getTime()) || ingresada < hoy) {
        console.log("La fecha no puede ser anterior a hoy.");
        fecha = null;
      }
    }
  } while (!fecha);
  return fecha;
};

// ==================== I/O IMPURAS ====================

const mostrarTarea = tarea => {
  console.log(`\nTítulo: ${tarea.titulo}`);
  console.log(`Descripción: ${tarea.descripcion}`);
  console.log(`Estado: ${tarea.estado}`);
  console.log(`Dificultad: ${tarea.dificultad}`);
  console.log(`Creación: ${tarea.creacion}`);
  console.log(`Última edición: ${tarea.ultimaEdicion}`);
  console.log(`Vencimiento: ${tarea.vencimiento}`);
  console.log("-----------------------------------");
};

// ==================== DATOS INICIALES (inmutables) ====================

const tareasIniciales = Object.freeze([
  crearTarea("Aprender HTML", "Hacer un curso de HTML", "pendiente", "fácil", "2025-12-31"),
  crearTarea("Aprender CSS", "Hacer un curso de CSS", "en curso", "medio", "2025-11-15"),
  crearTarea("Aprender JS", "Hacer un curso de JS", "pendiente", "difícil", "2025-12-01"),
  crearTarea("Aprender React", "Hacer un curso de React", "terminada", "difícil", "2025-10-10"),
]);

// ==================== FUNCIÓN PRINCIPAL (control impuro) ====================

const main = () => {
  let tareas = tareasIniciales;
  let eleccion;

  do {
    console.log("\n===== MENÚ PRINCIPAL =====");
    console.log("[1] Ver tareas");
    console.log("[2] Buscar tarea");
    console.log("[3] Agregar tarea");
    console.log("[0] Salir");

    eleccion = prompt("Elige una opción: ");

    switch (eleccion) {
      case "1":
        console.log("\n=== VER TAREAS ===");
        console.log("[1] Todas");
        console.log("[2] En curso");
        console.log("[3] Pendientes");
        console.log("[4] Terminadas");
        console.log("[5] Ordenadas por vencimiento");
        const opcionVer = prompt("Opción: ");

        const estados = { "2": "en curso", "3": "pendiente", "4": "terminada" };

        const tareasFiltradas = 
          opcionVer === "1" ? tareas :
          opcionVer === "5" ? ordenarPorVencimiento(tareas) :
          filtrarPorEstado(tareas, estados[opcionVer] || "");

        const titulos = obtenerTitulos(tareasFiltradas);
        titulos.length > 0 ? titulos.forEach(t => console.log(t)) : console.log("No hay tareas.");

        const detalle = prompt("¿Ver detalle de alguna tarea? (número o Enter): ");
        if (detalle) {
          const indice = parseInt(detalle) - 1;
          if (tareasFiltradas[indice]) {
            mostrarTarea(tareasFiltradas[indice]);
            const editar = prompt("¿Deseas editarla? (s/n): ");
            if (editar.toLowerCase() === "s") {
              const nuevoEstado = validarEstado();
              const nuevaDificultad = validarDificultad();
              const nuevoVencimiento = validarFecha();
              tareas = actualizarTarea(tareas, tareasFiltradas[indice].titulo, {
                estado: nuevoEstado,
                dificultad: nuevaDificultad,
                vencimiento: nuevoVencimiento
              });
              console.log("✅ Tarea actualizada correctamente.");
            }
          }
        }
        break;

      case "2":
        const titulo = prompt("Título exacto: ");
        const encontrada = buscarTareaPorTitulo(tareas, titulo);
        encontrada ? mostrarTarea(encontrada) : console.log("No se encontró la tarea.");
        break;

      case "3":
        console.log("\n=== NUEVA TAREA ===");
        const tituloNuevo = prompt("Título: ");
        const descripcionNueva = prompt("Descripción: ");
        const estadoNuevo = validarEstado();
        const dificultadNueva = validarDificultad();
        const vencimientoNuevo = validarFecha();

        const nuevaTarea = crearTarea(tituloNuevo, descripcionNueva, estadoNuevo, dificultadNueva, vencimientoNuevo);
        tareas = agregarTarea(tareas, nuevaTarea);
        console.log("✅ Tarea agregada correctamente.");
        break;

      case "0":
        console.log("👋 Saliendo del programa...");
        break;

      default:
        console.log("Opción inválida.");
        break;
    }
  } while (eleccion !== "0");
};


main();
