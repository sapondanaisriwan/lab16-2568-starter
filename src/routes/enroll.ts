import { Router } from "express";
import { adminCheck, authCheck } from "../middlewares/middelware.js";
import {
  listStdEnroll,
  resetEnroll,
  findStdEnroll,
  enrollCourse,
  removeCourse,
} from "../controller/enroll.controller.js";

const router = Router();

// admin only
router.get("/", authCheck, adminCheck, listStdEnroll);

// admin only
router.post("/reset", authCheck, adminCheck, resetEnroll);

// student and admin
router.get("/:studentId", authCheck, findStdEnroll);

// student only
router.post("/:studentId", authCheck, enrollCourse);

// student only
router.delete("/:studentId", authCheck, removeCourse);

export default router;
