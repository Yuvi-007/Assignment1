const dprModel = require('../models/dpr.model');
const projectModel = require('../models/project.model');

/**
 * @description  Create a new Daily Progress Report for a given project.
 *               The authenticated user is automatically recorded as the creator.
 * @route        POST /dpr
 * @access       Private (authenticated users)
 */
async function createDPR(req, res) {
    const { projectId, date, work_description, weather, worker_count } = req.body;

    if (!projectId || !date || !work_description || !weather || worker_count === undefined) {
        return res.status(400).json({
            message: "projectId, date, work_description, weather, and worker_count are required."
        });
    }

    try {
        // Verify the referenced project exists before creating a DPR under it
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
            createdBy: req.user.id  // Injected by auth middleware after JWT verification
        });

        res.status(201).json({
            message: "DPR created successfully.",
            dprId: dpr._id
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating DPR.", error });
    }
}

/**
 * @description  Fetch all DPRs for a specific project. Supports optional date filtering
 *               which queries across the full calendar day (not an exact timestamp match).
 * @route        GET /dpr?projectId=<id>&date=<YYYY-MM-DD>
 * @access       Private (authenticated users)
 */
async function listDPRs(req, res) {
    const { projectId, date } = req.query;

    if (!projectId) {
        return res.status(400).json({ message: "projectId query param is required." });
    }

    const filter = { project: projectId };

    // If a date filter is provided, build a range query for that entire calendar day
    // instead of matching an exact timestamp — handles any time recorded within that day
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

        // Populate createdBy to return readable user info instead of just the ObjectId
        const dprs = await dprModel.find(filter)
            .populate('createdBy', 'name username email')
            .sort({ date: -1 }); // Most recent DPRs first

        res.status(200).json({ total: dprs.length, dprs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching DPRs.", error });
    }
}

module.exports = { createDPR, listDPRs };