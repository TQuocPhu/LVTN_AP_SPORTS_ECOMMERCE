# 🛠️ Nhật Ký Cấu Trúc Module Frontend (Next.js App Router)

---

## 🌳 Cấu Trúc Thư Mục Frontend (Tree Structure)

```
d:\LVTN\frontend\
├── .env.local                                  # [Config] Biến môi trường local (NEXT_PUBLIC_API_URL)
├── .env.example                                # [Config] File mẫu biến môi trường
├── package.json
├── src/
    ├── app/                                    # [Page Layer] page.tsx, layout.tsx, sitemap.ts, robots.ts
    ├── components/                             # [Component Layer] UserManagement.tsx
    ├── controllers/                            # [FE Controller Layer] user-controller.ts (Gọi Backend REST API)
    ├── hooks/                                  # [Hook Layer] useUser.ts (Quản lý State React)
    ├── types/                                  # [Type Layer] user.ts, api.ts (Khớp với Response DTO của Backend)
    └── utils/                                  # [Utility Layer] Helper functions
```
