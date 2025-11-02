import { authService } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, avatar_url } = req.body;
    const result = await authService.register({
      name,
      email,
      password,
      phone,
      avatar_url,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
