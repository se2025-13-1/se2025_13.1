import { AddressRepository } from "./address.repository.js";

export const AddressService = {
  async createAddress(userId, payload) {
    return await AddressRepository.create({ userId, ...payload });
  },

  async getMyAddresses(userId) {
    return await AddressRepository.findAllByUserId(userId);
  },

  async updateAddress(id, userId, payload) {
    const updated = await AddressRepository.update(id, userId, payload);
    if (!updated) throw new Error("Address not found or permission denied");
    return updated;
  },

  async deleteAddress(id, userId) {
    const deleted = await AddressRepository.delete(id, userId);
    if (!deleted) throw new Error("Address not found or permission denied");
    return deleted;
  },

  async setAsDefault(id, userId) {
    const updated = await AddressRepository.setDefault(id, userId);
    if (!updated) throw new Error("Address not found");
    return updated;
  },
};
