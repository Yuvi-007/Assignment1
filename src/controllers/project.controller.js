const projectModel = require('../models/project.model');
const dprModel = require('../models/dpr.model');

async function createProject(req, res) {
    const { name, description, startDate, endDate, budget, location } = req.body;

    if (!name || !startDate || !endDate || budget === undefined) {
        return res.status(400).json({ message: "name, startDate, endDate, and budget are required." });
    }

    try {
        const project = await projectModel.create({
            name,
            description,
            startDate,
            endDate,
            budget,
            location,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Project created successfully.",
            projectId: project._id
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating project.", error });
    }
}

async function listProjects(req, res) {
    const { status, limit = 10, offset = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    try {
        const projects = await projectModel.find(filter)
            .populate('createdBy', 'name username email')
            .sort({ createdAt: -1 })
            .skip(Number(offset))
            .limit(Number(limit));

        const total = await projectModel.countDocuments(filter);

        res.status(200).json({ total, projects });
    } catch (error) {
        res.status(500).json({ message: "Error fetching projects.", error });
    }
}

async function getProject(req, res) {
    try {
        const project = await projectModel.findById(req.params.id)
            .populate('createdBy', 'name username email');

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        const dprs = await dprModel.find({ project: project._id })
            .populate('createdBy', 'name username email')
            .sort({ date: -1 });

        res.status(200).json({ ...project.toObject(), dprs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching project.", error });
    }
}

async function updateProject(req, res) {
    // Only include fields that were actually sent — avoids overwriting existing data with undefined
    const allowedFields = ['name', 'description', 'status', 'startDate', 'endDate', 'budget', 'location'];
    const updates = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields provided to update." });
    }

    try {
        const project = await projectModel.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        res.status(200).json({ message: "Project updated successfully.", project });
    } catch (error) {
        res.status(500).json({ message: "Error updating project.", error });
    }
}

async function deleteProject(req, res) {
    try {
        const project = await projectModel.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        // Cascade delete all DPRs for this project
        await dprModel.deleteMany({ project: req.params.id });

        res.status(200).json({ message: "Project deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting project.", error });
    }
}

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };