import Category from '../models/Category.js';
import { validationResult } from 'express-validator';

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    let filter = {};
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const categories = await Category.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private (SuperAdmin only)
export const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, color, icon } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { slug: name.toLowerCase().replace(/\s+/g, '-') }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = new Category({
      name,
      description,
      color: color || '#1976d2',
      icon: icon || 'article',
      createdBy: req.user.id
    });

    await category.save();

    const populatedCategory = await Category.findById(category._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: populatedCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private (SuperAdmin only)
export const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, color, icon, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        _id: { $ne: req.params.id },
        $or: [
          { name: { $regex: new RegExp(`^${name}$`, 'i') } },
          { slug: name.toLowerCase().replace(/\s+/g, '-') }
        ]
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (color) category.color = color;
    if (icon) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;
    category.updatedBy = req.user.id;

    await category.save();

    const updatedCategory = await Category.findById(category._id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (SuperAdmin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has associated content
    const Content = (await import('../models/Content.js')).default;
    const contentCount = await Content.countDocuments({ category: req.params.id });
    
    if (contentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${contentCount} associated content items. Please move or delete the content first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// @desc    Get category statistics
// @route   GET /api/v1/categories/stats
// @access  Private (SuperAdmin only)
export const getCategoryStats = async (req, res) => {
  try {
    const Content = (await import('../models/Content.js')).default;
    
    const stats = await Category.aggregate([
      {
        $lookup: {
          from: 'contents',
          localField: '_id',
          foreignField: 'category',
          as: 'content'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          color: 1,
          icon: 1,
          isActive: 1,
          totalContent: { $size: '$content' },
          publishedContent: {
            $size: {
              $filter: {
                input: '$content',
                cond: { $eq: ['$$this.status', 'published'] }
              }
            }
          },
          draftContent: {
            $size: {
              $filter: {
                input: '$content',
                cond: { $eq: ['$$this.status', 'draft'] }
              }
            }
          }
        }
      },
      {
        $sort: { totalContent: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category statistics',
      error: error.message
    });
  }
};
