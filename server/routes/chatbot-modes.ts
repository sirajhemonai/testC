import { Router } from "express";
import { z } from "zod";
import { insertChatbotModeSchema, insertLeadGenFieldSchema, insertProductSchema } from "../../shared/schema";
import { storage } from "../storage";

const router = Router();

// ChatBot Mode endpoints
router.get("/chatbot-modes", async (req, res) => {
  try {
    const modes = await storage.getChatbotModes();
    res.json(modes);
  } catch (error) {
    console.error("Error fetching chatbot modes:", error);
    res.status(500).json({ message: "Failed to fetch chatbot modes" });
  }
});

router.get("/chatbot-modes/active", async (req, res) => {
  try {
    const activeMode = await storage.getActiveChatbotMode();
    if (!activeMode) {
      res.status(404).json({ message: "No active chatbot mode found" });
      return;
    }
    res.json(activeMode);
  } catch (error) {
    console.error("Error fetching active chatbot mode:", error);
    res.status(500).json({ message: "Failed to fetch active chatbot mode" });
  }
});

router.get("/chatbot-modes/:id", async (req, res) => {
  try {
    const mode = await storage.getChatbotMode(Number(req.params.id));
    if (!mode) {
      res.status(404).json({ message: "Chatbot mode not found" });
      return;
    }
    res.json(mode);
  } catch (error) {
    console.error("Error fetching chatbot mode:", error);
    res.status(500).json({ message: "Failed to fetch chatbot mode" });
  }
});

router.post("/chatbot-modes", async (req, res) => {
  try {
    const modeData = insertChatbotModeSchema.parse(req.body);
    
    // Deactivate all other modes if this one is active
    if (modeData.isActive) {
      const allModes = await storage.getChatbotModes();
      for (const mode of allModes) {
        if (mode.isActive) {
          await storage.updateChatbotMode(mode.id, { isActive: false });
        }
      }
    }
    
    const mode = await storage.createChatbotMode(modeData);
    res.json(mode);
  } catch (error) {
    console.error("Error creating chatbot mode:", error);
    res.status(500).json({ message: "Failed to create chatbot mode" });
  }
});

router.put("/chatbot-modes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = insertChatbotModeSchema.partial().parse(req.body);
    
    // Deactivate all other modes if this one is being activated
    if (updates.isActive) {
      const allModes = await storage.getChatbotModes();
      for (const mode of allModes) {
        if (mode.id !== id && mode.isActive) {
          await storage.updateChatbotMode(mode.id, { isActive: false });
        }
      }
    }
    
    const mode = await storage.updateChatbotMode(id, updates);
    if (!mode) {
      res.status(404).json({ message: "Chatbot mode not found" });
      return;
    }
    res.json(mode);
  } catch (error) {
    console.error("Error updating chatbot mode:", error);
    res.status(500).json({ message: "Failed to update chatbot mode" });
  }
});

router.post("/chatbot-modes/:id/activate", async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Deactivate all other modes
    const allModes = await storage.getChatbotModes();
    for (const mode of allModes) {
      if (mode.isActive && mode.id !== id) {
        await storage.updateChatbotMode(mode.id, { isActive: false });
      }
    }
    
    // Activate the selected mode
    const mode = await storage.updateChatbotMode(id, { isActive: true });
    if (!mode) {
      res.status(404).json({ message: "Chatbot mode not found" });
      return;
    }
    
    res.json(mode);
  } catch (error) {
    console.error("Error activating chatbot mode:", error);
    res.status(500).json({ message: "Failed to activate chatbot mode" });
  }
});

router.delete("/chatbot-modes/:id", async (req, res) => {
  try {
    await storage.deleteChatbotMode(Number(req.params.id));
    res.json({ message: "Chatbot mode deleted successfully" });
  } catch (error) {
    console.error("Error deleting chatbot mode:", error);
    res.status(500).json({ message: "Failed to delete chatbot mode" });
  }
});

// Lead Generation Field endpoints
router.get("/lead-gen-fields", async (req, res) => {
  try {
    const fields = await storage.getLeadGenFields();
    res.json(fields);
  } catch (error) {
    console.error("Error fetching lead gen fields:", error);
    res.status(500).json({ message: "Failed to fetch lead gen fields" });
  }
});

router.get("/lead-gen-fields/active", async (req, res) => {
  try {
    const fields = await storage.getActiveLeadGenFields();
    res.json(fields);
  } catch (error) {
    console.error("Error fetching active lead gen fields:", error);
    res.status(500).json({ message: "Failed to fetch active lead gen fields" });
  }
});

router.post("/lead-gen-fields", async (req, res) => {
  try {
    const fieldData = insertLeadGenFieldSchema.parse(req.body);
    const field = await storage.createLeadGenField(fieldData);
    res.json(field);
  } catch (error) {
    console.error("Error creating lead gen field:", error);
    res.status(500).json({ message: "Failed to create lead gen field" });
  }
});

router.put("/lead-gen-fields/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = insertLeadGenFieldSchema.partial().parse(req.body);
    const field = await storage.updateLeadGenField(id, updates);
    if (!field) {
      res.status(404).json({ message: "Lead gen field not found" });
      return;
    }
    res.json(field);
  } catch (error) {
    console.error("Error updating lead gen field:", error);
    res.status(500).json({ message: "Failed to update lead gen field" });
  }
});

router.delete("/lead-gen-fields/:id", async (req, res) => {
  try {
    await storage.deleteLeadGenField(Number(req.params.id));
    res.json({ message: "Lead gen field deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead gen field:", error);
    res.status(500).json({ message: "Failed to delete lead gen field" });
  }
});

// Lead endpoints
router.get("/leads", async (req, res) => {
  try {
    const leads = await storage.getLeads();
    res.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

router.get("/leads/:id", async (req, res) => {
  try {
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }
    res.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ message: "Failed to fetch lead" });
  }
});

// Product endpoints
router.get("/products", async (req, res) => {
  try {
    const { category, active } = req.query;
    let products = await storage.getProducts();
    
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    if (active === 'true') {
      products = products.filter(p => p.isActive);
    }
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/products/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ message: "Query parameter 'q' is required" });
      return;
    }
    const products = await storage.searchProducts(q);
    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Failed to search products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const productData = insertProductSchema.parse(req.body);
    const product = await storage.createProduct(productData);
    res.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = insertProductSchema.partial().parse(req.body);
    const product = await storage.updateProduct(id, updates);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await storage.deleteProduct(Number(req.params.id));
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;