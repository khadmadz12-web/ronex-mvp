require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // <-- Zdna dynamic package d CORS hna

const app = express();
const PORT = process.env.PORT || 5000;

// Express Middleware
app.use(cors()); // <-- Khllina dynamic server i-supporti ayya link b7al Netlify direct!
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dynamic Mock Data store f l-mémoire (Db i-khdem dynamic)
let mockReactifs = [
  { id: 1, nom: "Glucose Kit", code: "GK-99", quantite: 2, seuil: 5, peremption: "2026-08-12", labo: "Labo Central" },
  { id: 2, nom: "Ethanol Absolute", code: "ET-05", quantite: 15, seuil: 3, peremption: "2027-01-20", labo: "Labo Central" },
  { id: 3, nom: "PCR Buffer", code: "PB-12", quantite: 8, seuil: 10, peremption: "2026-07-15", labo: "Labo Nord" },
  { id: 4, nom: "Kit Extraction ARN", code: "ARN-77", quantite: 20, seuil: 5, peremption: "2026-09-30", labo: "Labo Ouest" }
];

// Helper id generator
let nextId = 5;

// 1. API: Get Statistics (KPIs)
app.get('/api/stats', (req, res) => {
  try {
    const stockCritique = mockReactifs.filter(r => Number(r.quantite) <= Number(r.seuil)).length;
    const prochePeremption = mockReactifs.filter(r => new Date(r.peremption) < new Date('2026-11-01')).length;
    
    res.json({
      total: mockReactifs.length,
      critique: stockCritique,
      peremption: prochePeremption
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. API: Get All Reagents (Stock)
app.get('/api/reactifs', (req, res) => {
  res.json(mockReactifs);
});

// 3. API: Ajouter un réactif (Manuel)
app.post('/api/reactifs', (req, res) => {
  const { nom, code, quantite, seuil, peremption, labo } = req.body;
  const newReactif = { 
    id: nextId++, 
    nom, 
    code, 
    quantite: Number(quantite), 
    seuil: Number(seuil), 
    peremption, 
    labo: labo || "Labo Central" 
  };
  mockReactifs.push(newReactif);
  res.status(201).json(newReactif);
});

// 4. API: Modifier un réactif (PUT)
app.put('/api/reactifs/:id', (req, res) => {
  const { id } = req.params;
  const { nom, code, quantite, seuil, peremption } = req.body;
  
  const index = mockReactifs.findIndex(r => r.id === Number(id));
  
  if (index !== -1) {
    mockReactifs[index] = {
      ...mockReactifs[index],
      nom,
      code,
      quantite: Number(quantite),
      seuil: Number(seuil),
      peremption
    };
    return res.json(mockReactifs[index]);
  }
  
  res.status(404).json({ error: "Réactif introuvable" });
});

// 5. API: Supprimer un réactif (DELETE)
app.delete('/api/reactifs/:id', (req, res) => {
  const { id } = req.params;
  const index = mockReactifs.findIndex(r => r.id === Number(id));
  
  if (index !== -1) {
    const deletedItem = mockReactifs.splice(index, 1);
    return res.json({ message: "Supprimé avec succès", deleted: deletedItem[0] });
  }
  
  res.status(404).json({ error: "Réactif introuvable" });
});

app.listen(PORT, () => {
  console.log(`🚀 Ronex MVP running on port ${PORT}`);
});
