import { Request, Response, NextFunction } from 'express';
import { query } from '../database/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { config } from '../config/index.js';

export const getSops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM sops WHERE 1=1';
    const params: any[] = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length} OR title_ar ILIKE $${params.length} OR description_ar ILIKE $${params.length})`;
    }

    sql += ' ORDER BY title ASC';
    const result = await query(sql, params);

    const sops = result.rows.map((row: any) => ({
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      steps_ar: row.steps_ar
        ? typeof row.steps_ar === 'string' ? JSON.parse(row.steps_ar) : row.steps_ar
        : null,
    }));

    return res.status(200).json({ success: true, data: sops });
  } catch (error) {
    next(error);
  }
};

export const getSopById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM sops WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'SOP not found.' });
    }
    const row = result.rows[0];
    const sop = {
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      steps_ar: row.steps_ar
        ? typeof row.steps_ar === 'string' ? JSON.parse(row.steps_ar) : row.steps_ar
        : null,
    };
    return res.status(200).json({ success: true, data: sop });
  } catch (error) {
    next(error);
  }
};

export const createSop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, category, description, steps, title_ar, description_ar, steps_ar } = req.body;
  const createdBy = req.user?.id || null;

  try {
    const stepsJson = typeof steps === 'string' ? steps : JSON.stringify(steps);
    const stepsArJson = steps_ar
      ? typeof steps_ar === 'string' ? steps_ar : JSON.stringify(steps_ar)
      : null;

    const result = await query(
      `INSERT INTO sops (title, category, description, steps, created_by, title_ar, description_ar, steps_ar) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        title,
        category,
        description || null,
        stepsJson,
        createdBy,
        title_ar || null,
        description_ar || null,
        stepsArJson
      ]
    );

    const row = result.rows[0];
    const createdSop = {
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      steps_ar: row.steps_ar
        ? typeof row.steps_ar === 'string' ? JSON.parse(row.steps_ar) : row.steps_ar
        : null,
    };

    return res.status(201).json({ success: true, data: createdSop });
  } catch (error) {
    next(error);
  }
};

export const updateSop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, category, description, steps, title_ar, description_ar, steps_ar } = req.body;

  try {
    const checkRes = await query('SELECT id FROM sops WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'SOP not found.' });
    }

    const stepsJson = steps ? (typeof steps === 'string' ? steps : JSON.stringify(steps)) : undefined;
    const stepsArJson = steps_ar ? (typeof steps_ar === 'string' ? steps_ar : JSON.stringify(steps_ar)) : undefined;

    const result = await query(
      `UPDATE sops 
       SET title = COALESCE($1, title), 
           category = COALESCE($2, category), 
           description = COALESCE($3, description), 
           steps = COALESCE($4, steps),
           title_ar = COALESCE($5, title_ar),
           description_ar = COALESCE($6, description_ar),
           steps_ar = COALESCE($7, steps_ar),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 
       RETURNING *`,
      [title, category, description, stepsJson, title_ar, description_ar, stepsArJson, id]
    );

    const row = result.rows[0];
    const updatedSop = {
      ...row,
      steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
      steps_ar: row.steps_ar
        ? typeof row.steps_ar === 'string' ? JSON.parse(row.steps_ar) : row.steps_ar
        : null,
    };

    return res.status(200).json({ success: true, message: 'SOP updated successfully.', data: updatedSop });
  } catch (error) {
    next(error);
  }
};

export const deleteSop = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const checkRes = await query('SELECT id FROM sops WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'SOP not found.' });
    }

    await query('DELETE FROM sops WHERE id = $1', [id]);
    return res.status(200).json({ success: true, message: 'SOP deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const translateSop = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, steps } = req.body;

  try {
    const prompt = `
      You are EduSync AI, an expert school administrator and translator.
      Translate the following English standard operating procedure content (Title, Description, and Checklist Steps) into fluent, formal Arabic.
      
      English Content:
      Title: "${title}"
      Description: "${description || ''}"
      Steps: ${JSON.stringify(steps)}

      You MUST reply with a JSON object. Do not wrap it in markdown formatting (like \`\`\`json). The JSON object structure MUST be exactly:
      {
        "title_ar": "Arabic translated title",
        "description_ar": "Arabic translated description",
        "steps_ar": [
          { "step": 1, "title": "Arabic step title", "description": "Arabic step description", "role": "English role name, unchanged" }
        ]
      }
    `;

    if (config.geminiApiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.geminiApiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (response.ok) {
          const json = await response.json() as any;
          let text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          // Strip markdown code fences if generated
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const translated = JSON.parse(text);
          return res.status(200).json({ success: true, data: translated });
        }
      } catch (err: any) {
        console.warn('Gemini translate failed, falling back:', err.message);
      }
    }

    // Local fallback translation logic
    const translationsMap: Record<string, string> = {
      'student enrollment checklist': 'قائمة التحقق من تسجيل الطلاب',
      'exam grading & progression': 'درجات الاختبار والتقدم',
      'tuition billing & reminders': 'فوترة الرسوم الدراسية والتذكيرات',
      'erp backup & server deployment': 'نسخ نظام ERP احتياطيًا ونشر الخادم',
      'admissions': 'القبول والتسجيل',
      'academics': 'الشؤون الأكاديمية',
      'finance': 'الشؤون المالية',
      'operations': 'العمليات',
      'general': 'عام',
      'parent': 'ولي الأمر',
      'admin': 'المسؤول',
      'student': 'الطالب',
      'teacher': 'المعلم',
      'hod': 'رئيس القسم',
      'accountant': 'المحاسب',
    };

    const translateWord = (txt: string) => {
      const cleaned = txt.trim().toLowerCase();
      return translationsMap[cleaned] || `${txt} (مترجم)`;
    };

    const stepsArFallback = Array.isArray(steps)
      ? steps.map((s: any) => ({
          step: s.step,
          title: translateWord(s.title),
          description: s.description ? `${s.description} (مترجم)` : null,
          role: s.role,
        }))
      : [];

    return res.status(200).json({
      success: true,
      data: {
        title_ar: translateWord(title),
        description_ar: description ? `${description} (مترجم)` : null,
        steps_ar: stepsArFallback,
      },
    });
  } catch (error) {
    next(error);
  }
};
