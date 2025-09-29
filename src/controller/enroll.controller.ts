import type { Request, Response } from "express";
import { handleError } from "../utils/handleError.js";
import { handleRes } from "../utils/handleRes.js";
import { reset_enrollments, students, users } from "../db/db.js";
import type { CustomRequest } from "../libs/types.js";
import { zCourseId, zStudentId } from "../libs/zodValidators.js";

export const listStdEnroll = (req: CustomRequest, res: Response) => {
  try {
    const enrollInfo = students.map((std) => {
      return {
        studentId: std.studentId,
        courses: std.courses?.map((c) => ({ courseId: c })) ?? [],
      };
    });

    return handleRes(
      req,
      res,
      200,
      true,
      "🥳 Enrollments Information",
      enrollInfo
    );
  } catch (err) {
    return handleError(req, res, err);
  }
};

export const resetEnroll = (req: CustomRequest, res: Response) => {
  try {
    reset_enrollments();
    return handleRes(
      req,
      res,
      200,
      true,
      "😎 Enrollments database has been reset"
    );
  } catch (err) {
    return handleError(req, res, err);
  }
};

export const findStdEnroll = (req: CustomRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const isValid = zStudentId.safeParse(studentId);

    if (!isValid.success) {
      return handleRes(req, res, 404, false, "💀 ส่งไรมาคับพรี่");
    }

    const role = req.user?.role;
    const stdFound = students.find((std) => std?.studentId === studentId);
    const me = students.find((std) => std?.studentId === req.user?.studentId);

    if (stdFound && !stdFound.courses) {
      stdFound.courses = [];
    }
    if (me && !me.courses) {
      me.courses = [];
    }

    if (role === "ADMIN") {
      return handleRes(
        req,
        res,
        200,
        true,
        "Student Information",
        stdFound ?? []
      );
    } else if (role === "STUDENT") {
      return handleRes(req, res, 200, true, "🤓 Student Information", me ?? []);
    }
    return handleRes(req, res, 403, false, "👽 Forbidden access");
  } catch (err) {
    return handleError(req, res, err);
  }
};

export const enrollCourse = (req: CustomRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.body;
    const isCourseValid = zCourseId.safeParse(courseId);
    const isStdValid = zStudentId.safeParse(studentId);

    if (!isStdValid.success || !isCourseValid.success) {
      return handleRes(req, res, 404, false, "😭 พี่ชายส่งอะไรมาา");
    }

    const role = req.user?.role;
    const stdId = req.user?.studentId;

    if (!role) {
      return handleRes(req, res, 403, false, "😜 Role not found");
    }

    if (role === "ADMIN" || studentId !== stdId) {
      return handleRes(req, res, 403, false, "😉 Forbidden access");
    }

    const findStdIndex = students.findIndex(
      (std) => std.studentId === studentId
    );

    if (findStdIndex === -1) {
      return handleRes(
        req,
        res,
        409,
        false,
        `StudentId ${studentId} is not found`
      );
    }

    const hasDuplicateCourse =
      students[findStdIndex]?.courses?.includes(courseId) ?? false;

    if (hasDuplicateCourse) {
      return handleRes(
        req,
        res,
        409,
        false,
        `studentId ${studentId} && courseId ${courseId} is already exists`
      );
    }

    if (students[findStdIndex] && !students[findStdIndex].courses) {
      students[findStdIndex].courses = [];
    }

    students[findStdIndex]?.courses?.push(courseId);

    return handleRes(
      req,
      res,
      201,
      true,
      `Student ${studentId} && Course ${courseId} has been added successfully`,
      { studentId, courseId }
    );
  } catch (err) {
    return handleError(req, res, err);
  }
};

export const removeCourse = (req: CustomRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.body;

    const isStdValid = zStudentId.safeParse(studentId);
    const isCouValid = zCourseId.safeParse(courseId);

    if (!isStdValid.success || !isCouValid.success) {
      return handleRes(req, res, 409, false, "😊 น้องสาวส่งอะไรมาจ๊ะ");
    }

    if (req.user?.role === "ADMIN" || req.user?.studentId !== studentId) {
      return handleRes(
        req,
        res,
        403,
        false,
        "You are not allowed to modify another student's data"
      );
    }

    const findStdIndex = students.findIndex((s) => s.studentId === studentId);
    if (findStdIndex === -1) {
      return handleRes(
        req,
        res,
        409,
        false,
        `😊 StudentId ${studentId} is not found`
      );
    }

    if (students[findStdIndex] && !students[findStdIndex].courses) {
      students[findStdIndex].courses = [];
    }

    const findCourseIndex = students[findStdIndex]?.courses?.findIndex(
      (id) => id === courseId
    );

    if (findCourseIndex === undefined || findCourseIndex === -1) {
      return handleRes(req, res, 404, false, "😭 Enroll does not exits");
    }

    students[findStdIndex]?.courses?.splice(findCourseIndex, 1);
    const result = students.map((s) => {
      return { studentId: s.studentId, courseId: s.courses };
    });

    return handleRes(
      req,
      res,
      200,
      true,
      `😎 Student ${studentId} && Course ${courseId} has been deleted successfully`,
      result
    );
  } catch (err) {
    return handleError(req, res, err);
  }
};
