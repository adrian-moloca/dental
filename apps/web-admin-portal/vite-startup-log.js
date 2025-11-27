/**
 * Vite Startup Logger
 *
 * Logs clear startup information to help developers
 * know when the dev server is actually ready
 */

const BUILD_TIME = new Date().toISOString();

console.log('\n');
console.log('='.repeat(60));
console.log('🚀 ADMIN PORTAL DEV SERVER STARTING');
console.log('='.repeat(60));
console.log(`Build Time:    ${BUILD_TIME}`);
console.log(`Node Version:  ${process.version}`);
console.log(`Working Dir:   ${process.cwd()}`);
console.log(`Cache Dir:     /tmp/vite-cache-admin`);
console.log('='.repeat(60));
console.log('');
console.log('⚡ Vite will hot-reload when you save files');
console.log('🔑 Admin Portal runs on port 5174');
console.log('🔥 Hard refresh browser after changes: Ctrl+Shift+R');
console.log('');
console.log('='.repeat(60));
console.log('\n');

// Export so Vite can import it as a side-effect
export default {};
