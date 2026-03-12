const dprModel = require('../models/dpr.model');
const projectModel = require('../models/project.model');

async function createDPR(req, res) {
    const { projectId, date, work_description, weather, worker_count } = req.body;

    if (!projectId || !date || !work_description || !weather || worker_count === undefined) {
        return res.status(400).json({
            message: "projectId, date, work_description, weather, and worker_count are required."
        });
    }

    try {
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        const dpr = await dprModel.create({
            project: projectId,
            date,
            work_description,
            weather,
            worker_count,
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "DPR created successfully.",
            dprId: dpr._id
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating DPR.", error });
    }
}

async function listDPRs(req, res) {
    const { projectId, date } = req.query;

    if (!projectId) {
        return res.status(400).json({ message: "projectId query param is required." });
    }

    const filter = { project: projectId };

    if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        filter.date = { $gte: start, $lt: end };
    }

    try {
        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        const dprs = await dprModel.find(filter)
            .populate('createdBy', 'name username email')
            .sort({ date: -1 });

        res.status(200).json({ total: dprs.length, dprs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching DPRs.", error });
    }
}

module.exports = { createDPR, listDPRs };