import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { CreateVehicleRequest, UpdateVehicleRequest, Vehicle } from '../types/vehicle';

// Get all vehicles
export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*');

    if (error) {
      return res.status(500).json({ message: 'Error fetching vehicles', error });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get vehicle by ID
export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new vehicle
export const createVehicle = async (
  req: Request<{}, {}, CreateVehicleRequest>, 
  res: Response
) => {
  try {
    const { brand, model, plate } = req.body;

    // Check if plate already exists
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('plate', plate)
      .single();

    if (existingVehicle) {
      return res.status(409).json({ message: 'Vehicle with this plate already exists' });
    }

    // Create new vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .insert([
        { 
          brand, 
          model, 
          plate,
          status: 'available' 
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: 'Error creating vehicle', error });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a vehicle
export const updateVehicle = async (
  req: Request<{ id: string }, {}, UpdateVehicleRequest>, 
  res: Response
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if vehicle exists
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // If plate is being updated, check if it's already in use
    if (updates.plate && updates.plate !== existingVehicle.plate) {
      const { data: plateCheck } = await supabase
        .from('vehicles')
        .select('*')
        .eq('plate', updates.plate)
        .single();

      if (plateCheck) {
        return res.status(409).json({ message: 'Vehicle with this plate already exists' });
      }
    }

    // Update vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: 'Error updating vehicle', error });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a vehicle
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if vehicle exists
    const { data: existingVehicle, error: checkError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Delete vehicle
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ message: 'Error deleting vehicle', error });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 
