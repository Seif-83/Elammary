import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper: Calculate Tier
export const calcTier = (total) => {
  if (total >= 10000) return 'vip';
  if (total >= 4000) return 'loyal';
  return 'regular';
};

// -- CUSTOMERS --
export const getCustomers = async (search = '', tier = '') => {
  const colRef = collection(db, 'customers');
  let q = query(colRef, orderBy('total_purchases', 'desc'));
  
  const snapshot = await getDocs(q);
  let customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (search) {
    const s = search.toLowerCase();
    customers = customers.filter(c => 
      c.name?.toLowerCase().includes(s) || 
      c.phone?.toLowerCase().includes(s)
    );
  }
  
  if (tier) {
    customers = customers.filter(c => c.tier === tier);
  }
  
  return customers;
};

export const getCustomerDetail = async (id) => {
  const docRef = doc(db, 'customers', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Customer not found');
  
  const customer = { id: snap.id, ...snap.data() };
  
  const ordersQ = query(
    collection(db, 'orders'), 
    where('customer_id', '==', id),
    orderBy('order_date', 'desc')
  );
  const ordersSnap = await getDocs(ordersQ);
  const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  return { ...customer, orders };
};

export const addCustomer = async (data) => {
  return addDoc(collection(db, 'customers'), {
    ...data,
    total_purchases: 0,
    tier: data.tier || 'regular',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
};

export const updateCustomer = async (id, data) => {
  const docRef = doc(db, 'customers', id);
  return updateDoc(docRef, {
    ...data,
    updated_at: serverTimestamp()
  });
};

export const deleteCustomer = async (id) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'customers', id));
  
  // Also delete their orders
  const ordersQ = query(collection(db, 'orders'), where('customer_id', '==', id));
  const ordersSnap = await getDocs(ordersQ);
  ordersSnap.docs.forEach(d => batch.delete(d.ref));
  
  return batch.commit();
};

// -- ORDERS --
export const getOrders = async () => {
  const q = query(collection(db, 'orders'), orderBy('order_date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addOrder = async (orderData) => {
  const batch = writeBatch(db);
  
  // 1. Create Order
  const orderRef = doc(collection(db, 'orders'));
  batch.set(orderRef, {
    ...orderData,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
  
  // 2. If delivered, update customer total and tier
  if (orderData.status === 'delivered') {
    const custRef = doc(db, 'customers', orderData.customer_id);
    const snap = await getDoc(custRef);
    if (snap.exists()) {
      const newTotal = (snap.data().total_purchases || 0) + Number(orderData.price);
      batch.update(custRef, {
        total_purchases: newTotal,
        tier: calcTier(newTotal),
        updated_at: serverTimestamp()
      });
    }
  }
  
  return batch.commit();
};

export const updateOrder = async (id, data) => {
  const docRef = doc(db, 'orders', id);
  return updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
};

export const deleteOrder = async (id) => {
  return deleteDoc(doc(db, 'orders', id));
};

// -- PRODUCTS --
export const getProducts = async () => {
  const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addProduct = async (data) => {
  return addDoc(collection(db, 'products'), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });
};

export const updateProduct = async (id, data) => {
  const docRef = doc(db, 'products', id);
  return updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
};

export const deleteProduct = async (id) => {
  return deleteDoc(doc(db, 'products', id));
};

// -- DASHBOARD --
export const getDashboardStats = async () => {
  const customers = await getCustomers();
  const orders = await getOrders();
  
  const stats = {
    totalCustomers: customers.length,
    totalOrders: orders.length,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + Number(o.price), 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    inProgressOrders: orders.filter(o => o.status === 'in-progress').length,
    vipCustomers: customers.filter(c => c.tier === 'vip').length
  };
  
  // Aggregate for charts
  const tierDistribution = ['vip', 'loyal', 'regular'].map(t => ({
    tier: t,
    count: customers.filter(c => c.tier === t).length
  }));
  
  const ordersByStatus = ['pending', 'in-progress', 'delivered'].map(s => ({
    status: s,
    count: orders.filter(o => o.status === s).length
  }));
  
  // Revenue by month (simple mock for now or real logic)
  const revenueByMonth = []; // Implementation depends on required format
  
  return {
    stats,
    topCustomers: [...customers].sort((a,b) => b.total_purchases - a.total_purchases).slice(0, 5),
    recentOrders: orders.slice(0, 5),
    tierDistribution,
    ordersByStatus,
    revenueByMonth: [], // Can be filled if needed
    topFurnitureTypes: [] // Can be filled if needed
  };
};
