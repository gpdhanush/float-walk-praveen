import { pool, selectRows } from "../pool.js";
import { mapRow, mapRows } from "../rowMapper.js";
import { randomUUID } from "crypto";
function normalizeUserStatus(row) {
    const status = row.status;
    const normalized = status === "ACTIVE" || status === "INACTIVE"
        ? status
        : status === true || status === 1
            ? "ACTIVE"
            : "INACTIVE";
    return { ...row, status: normalized };
}
export class UserRepository {
    async create(data) {
        const id = data.id ?? randomUUID();
        await pool.execute(`INSERT INTO users (id, email, password_hash, name, role, status, store_name, gst_percent, theme, theme_color, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            data.email,
            data.passwordHash,
            data.name,
            data.role,
            data.status,
            data.storeName || "FootWear Pro",
            data.gstPercent ?? 18,
            data.theme || "light",
            data.themeColor || "blue",
            data.language || "en",
        ]);
        const rows = await selectRows("SELECT * FROM users WHERE id = ?", [id]);
        return normalizeUserStatus(mapRow(rows[0]));
    }
    async findById(id) {
        const rows = await selectRows("SELECT * FROM users WHERE id = ?", [id]);
        if (!rows.length)
            return null;
        return normalizeUserStatus(mapRow(rows[0]));
    }
    async findByEmail(email) {
        const rows = await selectRows("SELECT * FROM users WHERE email = ?", [email]);
        if (!rows.length)
            return null;
        return normalizeUserStatus(mapRow(rows[0]));
    }
    async findMany(filter) {
        const limit = Math.min(filter.limit ?? 10, 100);
        const offset = filter.offset ?? 0;
        let where = "WHERE 1=1";
        const params = [];
        if (filter.search) {
            where += " AND (name LIKE ? OR email LIKE ?)";
            params.push(`%${filter.search}%`, `%${filter.search}%`);
        }
        if (filter.role) {
            where += " AND role = ?";
            params.push(filter.role);
        }
        if (filter.status) {
            where += " AND status = ?";
            params.push(filter.status);
        }
        const countRows = await selectRows(`SELECT COUNT(*) as total FROM users ${where}`, params);
        const total = countRows[0]?.total ?? 0;
        const rows = await selectRows(`SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
        const users = mapRows(rows).map(normalizeUserStatus);
        return { users, total };
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        const map = {
            passwordHash: "password_hash",
            name: "name",
            role: "role",
            status: "status",
            storeName: "store_name",
            storeAddress: "store_address",
            phone: "phone",
            officePhone: "office_phone",
            gstPercent: "gst_percent",
            gstNumber: "gst_number",
            logoUrl: "logo_url",
            theme: "theme",
            themeColor: "theme_color",
            language: "language",
        };
        for (const [k, v] of Object.entries(data)) {
            if (v === undefined ||
                k === "id" ||
                k === "createdAt" ||
                k === "deletedAt")
                continue;
            const col = map[k] ?? k;
            fields.push(`${col} = ?`);
            values.push(v);
        }
        if (fields.length === 0)
            return this.findById(id);
        console.log("[UserRepository] Executing UPDATE with fields:", fields);
        console.log("[UserRepository] logoUrl size in update:", data.logoUrl
            ? `${(data.logoUrl.length / 1024).toFixed(0)}KB`
            : "not updating");
        values.push(id);
        try {
            const [result] = await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
            console.log("[UserRepository] Update successful, affected rows:", result.affectedRows);
        }
        catch (error) {
            console.error("[UserRepository] Update failed:", error.message);
            console.error("[UserRepository] Error code:", error.code);
            throw error;
        }
        const updated = await this.findById(id);
        console.log("[UserRepository] Fetched updated user, logoUrl length:", updated?.logoUrl?.length || 0);
        return updated;
    }
    async softDelete(id) {
        const [result] = await pool.execute("UPDATE users SET status = 0 WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}
//# sourceMappingURL=UserRepository.js.map