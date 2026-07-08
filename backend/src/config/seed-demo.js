require("reflect-metadata");

const bcrypt = require("bcrypt");

const AppDataSource = require("./db");
const Usuario = require("../entity/usuario.entity");
const Trabajador = require("../entity/trabajador.entity");
const Cliente = require("../entity/cliente.entity");
const Servicio = require("../entity/servicio.entity");
const Recurso = require("../entity/recurso.entity");
const Especializacion = require("../entity/especializacion.entity");
const AsignacionTrabajador = require("../entity/asignacionTrabajador.entity");
const AsignacionRecurso = require("../entity/asignacionRecurso.entity");
const ServicioRecurso = require("../entity/servicioRecurso.entity");
const ServicioEspecializacion = require("../entity/servicioEspecializacion.entity");
const ReporteTerreno = require("../entity/reporteTerreno.entity");
const Pago = require("../entity/pago.entity");
const Incidencia = require("../entity/incidencia.entity");

async function seedDemo() {
    await AppDataSource.initialize();
    await AppDataSource.synchronize(true);

    const usuarios = AppDataSource.getRepository(Usuario);
    const trabajadores = AppDataSource.getRepository(Trabajador);
    const clientes = AppDataSource.getRepository(Cliente);
    const servicios = AppDataSource.getRepository(Servicio);
    const recursos = AppDataSource.getRepository(Recurso);
    const especializaciones = AppDataSource.getRepository(Especializacion);
    const asignacionesTrabajadores = AppDataSource.getRepository(AsignacionTrabajador);
    const asignacionesRecursos = AppDataSource.getRepository(AsignacionRecurso);
    const serviciosRecursos = AppDataSource.getRepository(ServicioRecurso);
    const serviciosEspecializaciones = AppDataSource.getRepository(ServicioEspecializacion);
    const reportes = AppDataSource.getRepository(ReporteTerreno);
    const pagos = AppDataSource.getRepository(Pago);
    const incidencias = AppDataSource.getRepository(Incidencia);

    const hash = await bcrypt.hash("123456", 10);

    const [admin, supervisora, supervisor, trabajador1, trabajador2, trabajador3] = await usuarios.save([
        {
            run: "11.111.111-1",
            nombres: "Marcela",
            apellido_paterno: "Rivas",
            apellido_materno: "Fuentes",
            correo: "admin@aseopremium.cl",
            hash_contrasena: hash,
            rol: "ADMINISTRATIVO",
            activo: true
        },
        {
            run: "12.222.222-2",
            nombres: "Carolina",
            apellido_paterno: "Mendez",
            apellido_materno: "Salazar",
            correo: "supervisora@aseopremium.cl",
            hash_contrasena: hash,
            rol: "SUPERVISOR",
            activo: true
        },
        {
            run: "13.333.333-3",
            nombres: "Felipe",
            apellido_paterno: "Araya",
            apellido_materno: "Contreras",
            correo: "supervisor@aseopremium.cl",
            hash_contrasena: hash,
            rol: "SUPERVISOR",
            activo: true
        },
        {
            run: "14.444.444-4",
            nombres: "Javiera",
            apellido_paterno: "Morales",
            apellido_materno: "Vega",
            correo: "javiera.morales@aseopremium.cl",
            hash_contrasena: hash,
            rol: "TRABAJADOR",
            activo: true
        },
        {
            run: "15.555.555-5",
            nombres: "Cristian",
            apellido_paterno: "Soto",
            apellido_materno: "Paredes",
            correo: "cristian.soto@aseopremium.cl",
            hash_contrasena: hash,
            rol: "TRABAJADOR",
            activo: true
        },
        {
            run: "16.666.666-6",
            nombres: "Daniela",
            apellido_paterno: "Herrera",
            apellido_materno: "Leiva",
            correo: "daniela.herrera@aseopremium.cl",
            hash_contrasena: hash,
            rol: "TRABAJADOR",
            activo: true
        }
    ]);

    const especializacionesGuardadas = await especializaciones.save([
        { nombre: "Limpieza industrial" },
        { nombre: "Sanitizacion clinica" },
        { nombre: "Limpieza de vidrios en altura" },
        { nombre: "Mantencion de oficinas" },
        { nombre: "Manejo de residuos" }
    ]);

    const [limpiezaIndustrial, sanitizacion, vidrios, oficinas, residuos] = especializacionesGuardadas;

    const [t1, t2, t3] = await trabajadores.save([
        {
            usuario: trabajador1,
            fecha_contratacion: "2024-03-11",
            estado: "ASIGNADO",
            especializaciones: [limpiezaIndustrial, oficinas]
        },
        {
            usuario: trabajador2,
            fecha_contratacion: "2023-08-21",
            estado: "ASIGNADO",
            especializaciones: [sanitizacion, residuos]
        },
        {
            usuario: trabajador3,
            fecha_contratacion: "2025-01-13",
            estado: "DISPONIBLE",
            especializaciones: [vidrios, oficinas]
        }
    ]);

    const clientesGuardados = await clientes.save([
        {
            rut: "76.345.210-9",
            razon_social: "Clinica Santa Clara SpA",
            nombre_contacto: "Paula Valenzuela",
            telefono: "+56 9 6123 4567",
            correo: "paula.valenzuela@clinicasantaclara.cl",
            direccion: "Av. Libertad 1240",
            comuna: "Concepcion",
            ciudad: "Concepcion"
        },
        {
            rut: "77.908.654-1",
            razon_social: "Edificio Torre Biobio",
            nombre_contacto: "Rodrigo Cardenas",
            telefono: "+56 9 7345 2210",
            correo: "administracion@torrebiobio.cl",
            direccion: "O'Higgins 880",
            comuna: "Concepcion",
            ciudad: "Concepcion"
        },
        {
            rut: "78.112.445-6",
            razon_social: "Comercial Los Arrayanes Ltda.",
            nombre_contacto: "Natalia Sepulveda",
            telefono: "+56 41 245 8890",
            correo: "natalia@losarrayanes.cl",
            direccion: "Camino a Coronel 4550",
            comuna: "San Pedro de la Paz",
            ciudad: "Concepcion"
        },
        {
            rut: "79.654.321-3",
            razon_social: "Colegio Andalién",
            nombre_contacto: "Mauricio Lagos",
            telefono: "+56 9 8122 3099",
            correo: "operaciones@colegioandalien.cl",
            direccion: "Los Copihues 340",
            comuna: "Chiguayante",
            ciudad: "Concepcion"
        }
    ]);

    const recursosGuardados = await recursos.save([
        { nombre: "Desinfectante amonio cuaternario", descripcion: "Bidon de 5 litros para sanitizacion", stock_disponible: 34 },
        { nombre: "Paños microfibra", descripcion: "Set de panos reutilizables por color", stock_disponible: 120 },
        { nombre: "Aspiradora industrial", descripcion: "Equipo de alto flujo para oficinas y bodegas", stock_disponible: 8 },
        { nombre: "Carro estrujador doble balde", descripcion: "Carro de aseo profesional", stock_disponible: 15 },
        { nombre: "Guantes de nitrilo", descripcion: "Caja de 100 unidades talla M/L", stock_disponible: 48 },
        { nombre: "Escalera telescopica", descripcion: "Escalera certificada para vidrios en altura baja", stock_disponible: 5 }
    ]);

    const [desinfectante, panos, aspiradora, carro, guantes, escalera] = recursosGuardados;
    const [clinica, torre, comercial, colegio] = clientesGuardados;

    const serviciosGuardados = await servicios.save([
        {
            nombre_servicio: "Sanitizacion pabellones y boxes",
            direccion_servicio: "Av. Libertad 1240, Concepcion",
            fecha_inicio_programada: new Date("2026-07-08T08:00:00"),
            fecha_fin_programada: new Date("2026-07-08T16:00:00"),
            fecha_inicio_real: new Date("2026-07-08T08:12:00"),
            estado: "EN_PROCESO",
            semaforo: "AMARILLO",
            contrato_confirmado: true,
            observaciones: "Servicio con ingreso por acceso de proveedores.",
            cliente: clinica,
            creadoPor: admin,
            supervisor: supervisora
        },
        {
            nombre_servicio: "Mantencion diaria areas comunes",
            direccion_servicio: "O'Higgins 880, Concepcion",
            fecha_inicio_programada: new Date("2026-07-09T07:30:00"),
            fecha_fin_programada: new Date("2026-07-09T12:30:00"),
            estado: "ASIGNADO",
            semaforo: "VERDE",
            contrato_confirmado: true,
            observaciones: "Priorizar hall de acceso y ascensores.",
            cliente: torre,
            creadoPor: admin,
            supervisor
        },
        {
            nombre_servicio: "Limpieza profunda bodega central",
            direccion_servicio: "Camino a Coronel 4550, San Pedro de la Paz",
            fecha_inicio_programada: new Date("2026-07-10T09:00:00"),
            fecha_fin_programada: new Date("2026-07-10T18:00:00"),
            estado: "PENDIENTE",
            semaforo: "VERDE",
            contrato_confirmado: false,
            observaciones: "Cliente confirmara retiro de pallets antes del inicio.",
            cliente: comercial,
            creadoPor: admin,
            supervisor: supervisora
        },
        {
            nombre_servicio: "Limpieza vidrios salas y oficinas",
            direccion_servicio: "Los Copihues 340, Chiguayante",
            fecha_inicio_programada: new Date("2026-07-06T08:30:00"),
            fecha_fin_programada: new Date("2026-07-06T14:00:00"),
            fecha_inicio_real: new Date("2026-07-06T08:35:00"),
            fecha_fin_real: new Date("2026-07-06T13:45:00"),
            estado: "FINALIZADO",
            semaforo: "VERDE",
            contrato_confirmado: true,
            observaciones: "Servicio finalizado con conformidad del cliente.",
            cliente: colegio,
            creadoPor: admin,
            supervisor
        }
    ]);

    const [servicioClinica, servicioTorre, servicioBodega, servicioColegio] = serviciosGuardados;

    await serviciosEspecializaciones.save([
        { id_servicio: servicioClinica.id_servicio, id_especializacion: sanitizacion.id_especializacion, servicio: servicioClinica, especializacion: sanitizacion },
        { id_servicio: servicioTorre.id_servicio, id_especializacion: oficinas.id_especializacion, servicio: servicioTorre, especializacion: oficinas },
        { id_servicio: servicioBodega.id_servicio, id_especializacion: limpiezaIndustrial.id_especializacion, servicio: servicioBodega, especializacion: limpiezaIndustrial },
        { id_servicio: servicioBodega.id_servicio, id_especializacion: residuos.id_especializacion, servicio: servicioBodega, especializacion: residuos },
        { id_servicio: servicioColegio.id_servicio, id_especializacion: vidrios.id_especializacion, servicio: servicioColegio, especializacion: vidrios }
    ]);

    await serviciosRecursos.save([
        { id_servicio: servicioClinica.id_servicio, id_recurso: desinfectante.id_recurso, cantidad_requerida: 4, servicio: servicioClinica, recurso: desinfectante },
        { id_servicio: servicioClinica.id_servicio, id_recurso: guantes.id_recurso, cantidad_requerida: 3, servicio: servicioClinica, recurso: guantes },
        { id_servicio: servicioTorre.id_servicio, id_recurso: panos.id_recurso, cantidad_requerida: 20, servicio: servicioTorre, recurso: panos },
        { id_servicio: servicioTorre.id_servicio, id_recurso: carro.id_recurso, cantidad_requerida: 2, servicio: servicioTorre, recurso: carro },
        { id_servicio: servicioBodega.id_servicio, id_recurso: aspiradora.id_recurso, cantidad_requerida: 2, servicio: servicioBodega, recurso: aspiradora },
        { id_servicio: servicioColegio.id_servicio, id_recurso: escalera.id_recurso, cantidad_requerida: 1, servicio: servicioColegio, recurso: escalera }
    ]);

    await asignacionesTrabajadores.save([
        { servicio: servicioClinica, trabajador: t2, asignadoPor: supervisora },
        { servicio: servicioTorre, trabajador: t1, asignadoPor: supervisor },
        { servicio: servicioBodega, trabajador: t1, asignadoPor: supervisora },
        { servicio: servicioColegio, trabajador: t3, asignadoPor: supervisor }
    ]);

    await asignacionesRecursos.save([
        { servicio: servicioClinica, recurso: desinfectante, cantidad: 4 },
        { servicio: servicioClinica, recurso: guantes, cantidad: 3 },
        { servicio: servicioTorre, recurso: carro, cantidad: 2 },
        { servicio: servicioTorre, recurso: panos, cantidad: 20 },
        { servicio: servicioBodega, recurso: aspiradora, cantidad: 2 },
        { servicio: servicioColegio, recurso: escalera, cantidad: 1 }
    ]);

    await reportes.save([
        {
            servicio: servicioClinica,
            trabajador: t2,
            porcentaje_avance: 65,
            observaciones: "Boxes sanitizados; queda pendiente pabellon 3 por ocupacion medica."
        },
        {
            servicio: servicioColegio,
            trabajador: t3,
            porcentaje_avance: 100,
            observaciones: "Vidrios interiores y exteriores terminados sin observaciones."
        },
        {
            servicio: servicioTorre,
            trabajador: t1,
            porcentaje_avance: 20,
            observaciones: "Se realizo preparacion de insumos y revision de acceso."
        }
    ]);

    await pagos.save([
        {
            servicio: servicioClinica,
            monto: 620000,
            estado: "PENDIENTE",
            comprobante: null
        },
        {
            servicio: servicioTorre,
            monto: 310000,
            estado: "PENDIENTE",
            comprobante: null
        },
        {
            servicio: servicioColegio,
            monto: 280000,
            fecha_pago: new Date("2026-07-06T16:20:00"),
            estado: "PAGADO",
            comprobante: "COMP-2026-0712"
        }
    ]);

    await incidencias.save([
        {
            servicio: servicioClinica,
            reportadaPor: supervisora,
            tipo: "Retraso por acceso restringido",
            prioridad: "MEDIA",
            descripcion: "El equipo debio esperar autorizacion del area clinica para ingresar al pabellon 3.",
            estado: "ABIERTA",
            recursosRequeridos: []
        },
        {
            servicio: servicioTorre,
            reportadaPor: supervisor,
            tipo: "Falta de insumos",
            prioridad: "ALTA",
            descripcion: "El cliente solicito reforzar limpieza de ascensores y se requieren panos adicionales.",
            estado: "ABIERTA",
            recursosRequeridos: [
                {
                    recurso: panos,
                    cantidad_requerida: 12,
                    observacion: "Preferir panos azules para superficies de contacto."
                }
            ]
        },
        {
            servicio: servicioColegio,
            reportadaPor: supervisor,
            tipo: "Ventana con seguro danado",
            prioridad: "BAJA",
            descripcion: "Se detecto seguro suelto en ventana de sala de profesores antes de finalizar el servicio.",
            solucion: "Se informo a administracion del colegio y se dejo registro fotografico.",
            estado: "RESUELTA",
            fecha_resolucion: new Date("2026-07-06T13:35:00"),
            recursosRequeridos: []
        }
    ]);

    console.log("Base de datos demo cargada correctamente.");
    console.log("Usuarios de prueba:");
    console.log("  ADMINISTRATIVO: admin@aseopremium.cl / 123456");
    console.log("  SUPERVISOR: supervisora@aseopremium.cl / 123456");
    console.log("  TRABAJADOR: javiera.morales@aseopremium.cl / 123456");
}

seedDemo()
    .then(async () => {
        await AppDataSource.destroy();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error("Error al cargar datos demo:", error);

        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }

        process.exit(1);
    });
