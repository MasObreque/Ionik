// ================================
// CARGA MASIVA DE PRODUCTOS
// ================================

class ProductUploader {
    constructor() {
        this.uploadedProducts = [];
        this.currentImages = {};
    }
    
    // Procesar archivo CSV
    async processCsvFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    const products = this.parseCsv(csv);
                    resolve(products);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    }
    
    // Parsear CSV
    parseCsv(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const products = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            const product = {};
            
            headers.forEach((header, index) => {
                product[header] = values[index] ? values[index].trim() : '';
            });
            
            // Validar datos básicos
            if (product.name && product.price) {
                products.push({
                    id: product.id || `prod-${Date.now()}-${i}`,
                    name: product.name,
                    description: product.description || '',
                    price: parseFloat(product.price),
                    originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
                    category: product.category || 'general',
                    stock: parseInt(product.stock) || 0,
                    images: []
                });
            }
        }
        
        return products;
    }
    
    // Parsear línea CSV (maneja comillas)
    parseCsvLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }
    
    // Procesar imágenes múltiples
    async processImages(files, productId) {
        const images = [];
        
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const base64 = await this.fileToBase64(file);
                images.push({
                    name: file.name,
                    data: base64,
                    productId: productId
                });
            }
        }
        
        return images;
    }
    
    // Convertir archivo a Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // Subir producto con imágenes a Oracle
    async uploadProduct(product, images) {
        try {
            // 1. Subir producto
            const productResponse = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(product)
            });
            
            if (!productResponse.ok) {
                throw new Error('Error al crear producto');
            }
            
            const productData = await productResponse.json();
            const productId = productData.id;
            
            // 2. Subir imágenes
            if (images && images.length > 0) {
                await this.uploadImages(productId, images);
            }
            
            return productData;
        } catch (error) {
            console.error('Error al subir producto:', error);
            throw error;
        }
    }
    
    // Subir imágenes
    async uploadImages(productId, images) {
        const uploadPromises = images.map(async (image, index) => {
            const formData = new FormData();
            
            // Convertir base64 a blob
            const response = await fetch(image.data);
            const blob = await response.blob();
            
            formData.append('image', blob, image.name);
            formData.append('productId', productId);
            formData.append('order', index);
            
            return fetch('/api/admin/products/images', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });
        });
        
        await Promise.all(uploadPromises);
    }
    
    // Subida masiva
    async bulkUpload(products) {
        const results = {
            success: [],
            errors: []
        };
        
        for (const product of products) {
            try {
                const images = this.currentImages[product.id] || [];
                const uploaded = await this.uploadProduct(product, images);
                results.success.push(uploaded);
            } catch (error) {
                results.errors.push({
                    product: product.name,
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    // Obtener token de autenticación
    getAuthToken() {
        return localStorage.getItem('adminToken') || '';
    }
}

// ================================
// GESTIÓN DE INVENTARIO
// ================================

class InventoryManager {
    // Actualizar stock
    async updateStock(productId, newStock) {
        try {
            const response = await fetch(`/api/admin/products/${productId}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ stock: newStock })
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar stock');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
    
    // Obtener productos con bajo stock
    async getLowStockProducts(threshold = 10) {
        try {
            const response = await fetch(`/api/admin/products?lowStock=${threshold}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener productos');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
    
    // Exportar inventario
    async exportInventory() {
        try {
            const response = await fetch('/api/admin/inventory/export', {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al exportar inventario');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventario-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
    
    getAuthToken() {
        return localStorage.getItem('adminToken') || '';
    }
}

// ================================
// GESTIÓN DE ÓRDENES
// ================================

class OrderManager {
    // Obtener órdenes
    async getOrders(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/orders?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener órdenes');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
    
    // Actualizar estado de orden
    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ status })
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar orden');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
    
    // Obtener estadísticas
    async getStatistics(period = 'month') {
        try {
            const response = await fetch(`/api/admin/statistics?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al obtener estadísticas');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
    
    getAuthToken() {
        return localStorage.getItem('adminToken') || '';
    }
}

// ================================
// INTERFAZ DE ADMINISTRACIÓN
// ================================

class AdminUI {
    constructor() {
        this.uploader = new ProductUploader();
        this.inventory = new InventoryManager();
        this.orders = new OrderManager();
    }
    
    // Inicializar interfaz de carga
    initUploadInterface(containerId) {
        const container = document.getElementById(containerId);
        
        container.innerHTML = `
            <div class="admin-panel">
                <h2>Carga Masiva de Productos</h2>
                
                <div class="upload-section">
                    <h3>1. Subir archivo CSV</h3>
                    <input type="file" id="csvFile" accept=".csv" />
                    <button onclick="adminUI.processCsv()">Procesar CSV</button>
                </div>
                
                <div class="upload-section">
                    <h3>2. Asignar imágenes a productos</h3>
                    <div id="productsList"></div>
                </div>
                
                <div class="upload-section">
                    <h3>3. Confirmar y subir</h3>
                    <button onclick="adminUI.uploadAll()" class="btn-primary">
                        Subir Todos los Productos
                    </button>
                </div>
                
                <div id="uploadProgress"></div>
            </div>
        `;
    }
    
    // Procesar CSV
    async processCsv() {
        const fileInput = document.getElementById('csvFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Por favor selecciona un archivo CSV');
            return;
        }
        
        try {
            const products = await this.uploader.processCsvFile(file);
            this.displayProducts(products);
            this.uploader.uploadedProducts = products;
        } catch (error) {
            alert('Error al procesar CSV: ' + error.message);
        }
    }
    
    // Mostrar productos
    displayProducts(products) {
        const list = document.getElementById('productsList');
        
        list.innerHTML = products.map(product => `
            <div class="product-upload-item">
                <h4>${product.name}</h4>
                <p>Precio: $${product.price}</p>
                <input type="file" 
                       id="images-${product.id}" 
                       accept="image/*" 
                       multiple 
                       onchange="adminUI.handleImages('${product.id}')" />
                <div id="preview-${product.id}" class="image-preview"></div>
            </div>
        `).join('');
    }
    
    // Manejar imágenes
    async handleImages(productId) {
        const input = document.getElementById(`images-${productId}`);
        const files = Array.from(input.files);
        
        const images = await this.uploader.processImages(files, productId);
        this.uploader.currentImages[productId] = images;
        
        // Mostrar preview
        const preview = document.getElementById(`preview-${productId}`);
        preview.innerHTML = images.map(img => 
            `<img src="${img.data}" style="width: 100px; height: 100px; object-fit: cover; margin: 5px;" />`
        ).join('');
    }
    
    // Subir todos los productos
    async uploadAll() {
        const progress = document.getElementById('uploadProgress');
        progress.innerHTML = '<p>Subiendo productos...</p>';
        
        try {
            const results = await this.uploader.bulkUpload(this.uploader.uploadedProducts);
            
            progress.innerHTML = `
                <h3>Resultados</h3>
                <p>Exitosos: ${results.success.length}</p>
                <p>Errores: ${results.errors.length}</p>
                ${results.errors.length > 0 ? `
                    <ul>
                        ${results.errors.map(e => `<li>${e.product}: ${e.error}</li>`).join('')}
                    </ul>
                ` : ''}
            `;
        } catch (error) {
            progress.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    }
}

// Instancia global
const adminUI = new AdminUI();