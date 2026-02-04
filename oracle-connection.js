// ================================
// CONFIGURACIÓN ORACLE CLOUD
// ================================

const oracledb = require('oracledb');

// Configuración de conexión
const dbConfig = {
    user: process.env.ORACLE_USER || 'IONIK_USER',
    password: process.env.ORACLE_PASSWORD || 'your_password',
    connectString: process.env.ORACLE_CONNECTION_STRING || 
        '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=your-oracle-host)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=your_service)))'
};

// Pool de conexiones
let pool;

// ================================
// INICIALIZAR POOL
// ================================

async function initialize() {
    try {
        pool = await oracledb.createPool({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 2,
            poolTimeout: 60
        });
        
        console.log('Pool de conexiones Oracle creado exitosamente');
    } catch (error) {
        console.error('Error al crear pool de conexiones:', error);
        throw error;
    }
}

// ================================
// OBTENER CONEXIÓN
// ================================

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.error('Error al obtener conexión:', error);
        throw error;
    }
}

// ================================
// CERRAR POOL
// ================================

async function close() {
    try {
        await pool.close(10);
        console.log('Pool de conexiones cerrado');
    } catch (error) {
        console.error('Error al cerrar pool:', error);
    }
}

// ================================
// PRODUCTOS - CRUD
// ================================

class ProductsDB {
    // Obtener todos los productos
    static async getAll(filters = {}) {
        let connection;
        try {
            connection = await getConnection();
            
            let query = `
                SELECT p.*, 
                       (SELECT COUNT(*) FROM PRODUCT_IMAGES WHERE PRODUCT_ID = p.ID) as IMAGE_COUNT
                FROM PRODUCTS p
                WHERE 1=1
            `;
            
            const binds = {};
            
            if (filters.category) {
                query += ' AND CATEGORY = :category';
                binds.category = filters.category;
            }
            
            if (filters.featured) {
                query += ' AND FEATURED = :featured';
                binds.featured = filters.featured;
            }
            
            if (filters.inStock) {
                query += ' AND STOCK > 0';
            }
            
            query += ' ORDER BY CREATED_AT DESC';
            
            const result = await connection.execute(query, binds, {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });
            
            return result.rows;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    // Obtener producto por ID
    static async getById(id) {
        let connection;
        try {
            connection = await getConnection();
            
            const result = await connection.execute(
                `SELECT * FROM PRODUCTS WHERE ID = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                return null;
            }
            
            const product = result.rows[0];
            
            // Obtener imágenes
            const images = await connection.execute(
                `SELECT * FROM PRODUCT_IMAGES WHERE PRODUCT_ID = :id ORDER BY IMAGE_ORDER`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            product.images = images.rows;
            
            return product;
        } catch (error) {
            console.error('Error al obtener producto:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    // Crear producto
    static async create(productData) {
        let connection;
        try {
            connection = await getConnection();
            
            const result = await connection.execute(
                `INSERT INTO PRODUCTS (
                    ID, NAME, DESCRIPTION, PRICE, ORIGINAL_PRICE, 
                    CATEGORY, STOCK, RATING, REVIEWS, FEATURED, BADGE
                ) VALUES (
                    :id, :name, :description, :price, :originalPrice,
                    :category, :stock, :rating, :reviews, :featured, :badge
                ) RETURNING ID INTO :newId`,
                {
                    id: productData.id || `PROD_${Date.now()}`,
                    name: productData.name,
                    description: productData.description || null,
                    price: productData.price,
                    originalPrice: productData.originalPrice || null,
                    category: productData.category,
                    stock: productData.stock || 0,
                    rating: productData.rating || 0,
                    reviews: productData.reviews || 0,
                    featured: productData.featured ? 1 : 0,
                    badge: productData.badge || null,
                    newId: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
                }
            );
            
            await connection.commit();
            
            return { id: result.outBinds.newId[0] };
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Error al crear producto:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    // Actualizar producto
    static async update(id, updates) {
        let connection;
        try {
            connection = await getConnection();
            
            const fields = [];
            const binds = { id };
            
            Object.keys(updates).forEach(key => {
                fields.push(`${key.toUpperCase()} = :${key}`);
                binds[key] = updates[key];
            });
            
            binds.updatedAt = new Date();
            fields.push('UPDATED_AT = :updatedAt');
            
            await connection.execute(
                `UPDATE PRODUCTS SET ${fields.join(', ')} WHERE ID = :id`,
                binds
            );
            
            await connection.commit();
            
            return { success: true };
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Error al actualizar producto:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    // Eliminar producto
    static async delete(id) {
        let connection;
        try {
            connection = await getConnection();
            
            // Eliminar imágenes primero
            await connection.execute(
                `DELETE FROM PRODUCT_IMAGES WHERE PRODUCT_ID = :id`,
                { id }
            );
            
            // Eliminar producto
            await connection.execute(
                `DELETE FROM PRODUCTS WHERE ID = :id`,
                { id }
            );
            
            await connection.commit();
            
            return { success: true };
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Error al eliminar producto:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    // Actualizar stock
    static async updateStock(id, stock) {
        let connection;
        try {
            connection = await getConnection();
            
            await connection.execute(
                `UPDATE PRODUCTS SET STOCK = :stock, UPDATED_AT = CURRENT_TIMESTAMP 
                 WHERE ID = :id`,
                { id, stock }
            );
            
            await connection.commit();
            
            return { success: true };
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Error al actualizar stock:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

// ================================
// IMÁGENES - CRUD
// ================================

class ImagesDB {
    // Agregar imagen
    static async create(imageData) {
        let connection;
        try {
            connection = await getConnection();
            
            await connection.execute(
                `INSERT INTO PRODUCT_IMAGES (
                    ID, PRODUCT_ID, IMAGE_URL, IMAGE_ORDER
                ) VALUES (
                    :id, :productId, :imageUrl, :imageOrder
                )`,
                {
                    id: `IMG_${Date.now()}_${imageData.order}`,
                    productId: imageData.productId,
                    imageUrl: imageData.url,
                    imageOrder: imageData.order || 0
                }
            );
            
            await connection.commit();
            
            return { success: true };
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Error al crear imagen:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    // Obtener imágenes de un producto
    static async getByProductId(productId) {
        let connection;
        try {
            connection = await getConnection();
            
            const result = await connection.execute(
                `SELECT * FROM PRODUCT_IMAGES 
                 WHERE PRODUCT_ID = :productId 
                 ORDER BY IMAGE_ORDER`,
                { productId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            return result.rows;
        } catch (error) {
            console.error('Error al obtener imágenes:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

// ================================
// ÓRDENES - CRUD
// ================================

class OrdersDB {
    // Crear orden
    static async create(orderData) {
        let connection;
        try {
            connection = await getConnection();
            
            const orderId = `ORDER_${Date.now()}`;
            
            // Insertar orden
            await connection.execute(
                `INSERT INTO ORDERS (
                    ID, CUSTOMER_EMAIL, CUSTOMER_NAME, TOTAL, STATUS, PAYMENT_METHOD
                ) VALUES (
                    :id, :email, :name, :total, :status, :paymentMethod
                )`,
                {
                    id: orderId,
                    email: orderData.email,
                    name: orderData.name,
                    total: orderData.total,
                    status: 'pending',
                    paymentMethod: orderData.paymentMethod
                }
            );
            
            // Insertar items
            for (const item of orderData.items) {
                await connection.execute(
                    `INSERT INTO ORDER_ITEMS (
                        ID, ORDER_ID, PRODUCT_ID, QUANTITY, PRICE
                    ) VALUES (
                        :id, :orderId, :productId, :quantity, :price
                    )`,
                    {
                        id: `ITEM_${Date.now()}_${Math.random()}`,
                        orderId,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }
                );
            }
            
            await connection.commit();
            
            return { orderId };
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Error al crear orden:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    // Obtener órdenes
    static async getAll(filters = {}) {
        let connection;
        try {
            connection = await getConnection();
            
            let query = 'SELECT * FROM ORDERS WHERE 1=1';
            const binds = {};
            
            if (filters.status) {
                query += ' AND STATUS = :status';
                binds.status = filters.status;
            }
            
            if (filters.email) {
                query += ' AND CUSTOMER_EMAIL = :email';
                binds.email = filters.email;
            }
            
            query += ' ORDER BY CREATED_AT DESC';
            
            const result = await connection.execute(query, binds, {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });
            
            return result.rows;
        } catch (error) {
            console.error('Error al obtener órdenes:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
    
    // Actualizar estado de orden
    static async updateStatus(orderId, status) {
        let connection;
        try {
            connection = await getConnection();
            
            await connection.execute(
                `UPDATE ORDERS SET STATUS = :status, UPDATED_AT = CURRENT_TIMESTAMP 
                 WHERE ID = :orderId`,
                { orderId, status }
            );
            
            await connection.commit();
            
            return { success: true };
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            console.error('Error al actualizar orden:', error);
            throw error;
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }
}

// ================================
// EXPORTAR MÓDULOS
// ================================

module.exports = {
    initialize,
    getConnection,
    close,
    ProductsDB,
    ImagesDB,
    OrdersDB
};