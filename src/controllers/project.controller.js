const projectModel = require('../models/project.model');
const dprModel = require('../models/dpr.model');

/**
 * @description  Create a new construction project. The authenticated user is
 *               automatically recorded as the creator.
 * @route        POST /projects
 * @access       Private (admin, manager)
 */
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
            createdBy: req.user.id  // Injected by auth middleware after JWT verification
        });

        res.status(201).json({
            message: "Project created successfully.",
            projectId: project._id
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating project.", error });
    }
}

/**
 * @description  Fetch a paginated list of all projects. Supports optional filtering
 *               by status and pagination via limit/offset query params.
 * @route        GET /projects?status=<status>&limit=<n>&offset=<n>
 * @access       Private (authenticated users)
 */
async function listProjects(req, res) {
    // Default to 10 results starting from the beginning if not specified
    const { status, limit = 10, offset = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status; // Only apply status filter if explicitly passed

    try {
        const projects = await projectModel.find(filter)
            .populate('createdBy', 'name username email')
            .sort({ createdAt: -1 }) // Newest projects first
            .skip(Number(offset))    // Used for pagination — skip already-seen results
            .limit(Number(limit));   // Cap results per page

        // Run a separate count query so the client knows the total for pagination UI
        const total = await projectModel.countDocuments(filter);

        res.status(200).json({ total, projects });
    } catch (error) {
        res.status(500).json({ message: "Error fetching projects.", error });
    }
}

/**
 * @description  Fetch a single project by ID along with all its associated DPRs,
 *               sorted by date descending.
 * @route        GET /projects/:id
 * @access       Private (authenticated users)
 */
async function getProject(req, res) {
    try {
        const project = await projectModel.findById(req.params.id)
            .populate('createdBy', 'name username email');

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        // Fetch associated DPRs separately and attach them to the response,
        // since DPRs are stored in their own collection (not embedded in the project)
        const dprs = await dprModel.find({ project: project._id })
            .populate('createdBy', 'name username email')
            .sort({ date: -1 });

        // Spread the Mongoose document as a plain object so we can append the dprs array
        res.status(200).json({ ...project.toObject(), dprs });
    } catch (error) {
        res.status(500).json({ message: "Error fetching project.", error });
    }
}

/**
 * @description  Partially update a project. Only fields explicitly provided in the
 *               request body are updated — omitted fields are left unchanged.
 * @route        PUT /projects/:id
 * @access       Private (admin, manager)
 */
async function updateProject(req, res) {
    // Build the update object dynamically — only include fields that were
    // actually sent in the request body to avoid overwriting existing data with undefined
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
        // { new: true } returns the updated document instead of the original
        // { runValidators: true } ensures Mongoose schema validations still apply on update
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

/**
 * @description  Delete a project by ID and cascade-delete all associated DPRs
 *               to prevent orphaned records in the database.
 * @route        DELETE /projects/:id
 * @access       Private (admin only)
 */
async function deleteProject(req, res) {
    try {
        const project = await projectModel.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        // Cascade delete — remove all DPRs linked to this project so no orphaned
        // records remain in the database after the project is gone
        await dprModel.deleteMany({ project: req.params.id });

        res.status(200).json({ message: "Project deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting project.", error });
    }
}

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };