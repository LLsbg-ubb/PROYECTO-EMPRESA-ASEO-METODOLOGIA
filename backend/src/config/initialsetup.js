require('reflect-metadata');
const AppDataSource = require('./db');

const initialSetup = async () => {
  try {
    console.log('🔄 Iniciando configuración inicial...');
    
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida');

    await AppDataSource.synchronize(true);
    console.log('✅ Tablas creadas/sincronizadas');

    console.log('✨ Configuración completada con éxito');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la configuración inicial:', error);
    process.exit(1);
  }
};

initialSetup();