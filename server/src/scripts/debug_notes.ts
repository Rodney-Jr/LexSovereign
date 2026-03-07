/**
 * TEMPORARY DEBUG ROUTE - Remove after debugging
 * Add to auth.ts temporarily to diagnose 401 issue
 */

// Add this route BEFORE the /login route in auth.ts:
// router.post('/debug-login', async (req, res) => {
//     const { email } = req.body;
//     const user = await prisma.user.findUnique({ where: { email } });
//     res.json({ found: !!user, email: user?.email, roleString: user?.roleString, hasHash: !!user?.passwordHash });
// });
