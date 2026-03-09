// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://xyztqvcehfqlkzoeivff.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enRxdmNlaGZxbGt6b2VpdmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Mzg3MzQsImV4cCI6MjA4ODAxNDczNH0.8NuWVb0ngl769Cohfdeyjc0ZUIBw9sSmavlmuR501zA';

if (typeof window.sb === 'undefined' && typeof supabase !== 'undefined') {
    window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
const sb = window.sb;

// Explicitly define global variables on window
window.currentUser = null;
window.profile = null;
window.isGuest = false;

let activePopups = [], currentNotifFilter = 'all';

// Define local accessors for convenience
const getCurrentUser = () => window.currentUser;
const getProfile = () => window.profile;

// 1. Shared UI Helpers
function getAvatarHTML(n, u, a = '') {
    if (window.isGuest && !u) return `<div class="avatar-small" ${a} style="background:#333; color:#666;"><i class="fas fa-user-secret"></i></div>`;
    return u ? `<div class="avatar-small" ${a}><img src="${u}"></div>` : `<div class="avatar-small" ${a}>${n ? n.substring(0, 2).toUpperCase() : '??'}</div>`;
}

function getBadgeHTML(r, isSuper, name) {
    if (window.isGuest) return `<span class="badge" style="background:rgba(255,255,255,0.05); color:#444;">Guest</span>`;
    if (isSuper || name === 'admin') return `<span class="badge badge-superadmin">Super Admin</span>`;
    let rank = r || 'Aspirant';
    if (rank === 'Rookie' || rank === 'Member') rank = 'Aspirant';
    const rankLower = rank.toLowerCase();
    const validRanks = ['aspirant', 'official', 'admin', 'superadmin'];
    const finalRank = validRanks.includes(rankLower) ? rankLower : 'aspirant';
    return `<span class="badge badge-${finalRank}">${rank}</span>`;
}

// 2. Global UI Injection (Sidebar + Header)
function injectSharedUI() {
    const isGuestSession = localStorage.getItem('isGuest') === 'true';
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    
    const sidebarHTML = `
        <nav class="sidebar">
            <style>
                .brand-subtitle {
                    animation: kidlatFlicker 4s linear infinite;
                    color: var(--honda-red);
                    text-shadow: 0 0 5px rgba(227, 6, 19, 0.2);
                }
                @keyframes kidlatFlicker {
                    0%, 18%, 22%, 25%, 53%, 57%, 100% {
                        opacity: 1;
                        filter: brightness(1);
                        text-shadow: 0 0 5px rgba(227, 6, 19, 0.5);
                    }
                    20%, 24%, 55% {
                        opacity: 0.3;
                        filter: brightness(2);
                        text-shadow: 0 0 20px var(--honda-red), 0 0 40px var(--honda-red);
                    }
                }
            </style>
            <div class="brand">
                <img src="assets/logo.png" class="brand-logo">
                <img src="assets/logo2.png" class="brand-title-img">
                <p class="brand-subtitle">PANABO ZONE</p>
            </div>

            <div class="nav-menu">
                ${!isGuestSession ? `
                <span class="menu-label">MAIN MENU</span>
                <a href="index.html" class="nav-btn" id="nav-index"><i class="fas fa-home"></i> <span>Feed</span></a>
                <a href="messenger.html" target="_blank" class="nav-btn" id="nav-messenger"><i class="fab fa-facebook-messenger"></i> <span>Messenger</span></a>
                ` : ''}
                
                <span class="menu-label">DISCOVER</span>
                <a href="marketplace.html" class="nav-btn" id="nav-marketplace"><i class="fas fa-store"></i> <span>Marketplace</span></a>
                
                ${!isGuestSession ? `
                <a href="garage.html" class="nav-btn" id="nav-garage"><i class="fas fa-motorcycle"></i> <span>Garage</span></a>
                
                <span class="menu-label">RIDER HUB</span>
                <a href="events.html" class="nav-btn" id="nav-events"><i class="fas fa-calendar-star"></i> <span>Events</span></a>
                <a href="maintenance.html" class="nav-btn" id="nav-maintenance"><i class="fas fa-wrench"></i> <span>Maintenance</span></a>
                
                <div id="admin-nav-section" class="hidden">
                    <span class="menu-label" style="color:var(--honda-red);">ADMINISTRATION</span>
                    <a href="admin.html" class="nav-btn" id="nav-admin" style="color:var(--honda-red);"><i class="fas fa-key"></i> <span>Admin Panel</span></a>                </div>
                ` : ''}
            </div>

            <div class="sidebar-footer">
                <div class="footer-profile">
                    <div id="u-avatar"></div>
                    <div class="footer-info">
                        <h4 id="u-name">${isGuestSession ? 'GUEST RIDER' : 'RIDER'}</h4>
                        <div id="u-badge-cont"></div>
                    </div>
                </div>
                <div class="footer-actions">
                    ${!isGuestSession ? `<a href="profile.html" class="btn-neon small-btn"><i class="fas fa-cog"></i> PROFILE</a>` : ''}
                    <button class="btn-neon small-btn" onclick="logout(event)"><i class="fas fa-sign-out-alt"></i> ${isGuestSession ? 'EXIT' : 'OUT'}</button>
                </div>
                <button class="btn-neon theme-toggle" onclick="toggleMode()">
                    <i class="fas fa-adjust"></i> <span id="mode-text">LIGHT MODE</span>
                </button>
            </div>
        </nav>
    `;

    const headerHTML = `
        <div class="global-header">
            <div class="header-left">
                <h2 id="page-title">ICPH HUB</h2>
            </div>
            
            ${currentPage === 'index.html' ? `
            <div class="header-mobile-search-toggle" onclick="toggleMobileSearch()">
                <i class="fas fa-search"></i>
            </div>
            <div class="header-center">
                <div class="global-search-container">
                    <i class="fas fa-search"></i>
                    <input type="text" id="global-rider-search" placeholder="Search riders..." oninput="performGlobalSearch()">
                    <div id="global-search-results" class="hidden"></div>
                </div>
            </div>
            ` : '<div style="flex:1"></div>'}

            <div class="header-right">
                ${!isGuestSession ? `
                <div class="notif-bell-cont" onclick="toggleNotifDropdown()">
                    <i class="fas fa-bell"></i>
                    <div id="notif-count" class="notif-badge hidden">0</div>
                    <div id="notif-dropdown" class="notif-dropdown hidden" onclick="event.stopPropagation()">
                        <div class="notif-header" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #222;">
                            <span style="font-size:0.8rem; letter-spacing:2px;">NOTIFICATIONS</span>
                            <div style="display:flex; gap:8px;">
                                <button onclick="event.stopPropagation(); markAllNotifsAsRead()" style="background:#1a1a1a; border:1px solid #333; color:#888; font-size:0.6rem; padding:5px 8px; border-radius:5px; cursor:pointer; font-family:'Orbitron'; font-weight:700;">MARK ALL READ</button>
                                <button onclick="event.stopPropagation(); clearAllNotifications()" style="background:rgba(227,6,19,0.1); border:1px solid var(--honda-red); color:var(--honda-red); font-size:0.6rem; padding:5px 8px; border-radius:5px; cursor:pointer; font-family:'Orbitron'; font-weight:700;">CLEAR ALL</button>
                            </div>
                        </div>
                        <div class="notif-filters">
                            <button onclick="setNotifFilter('all')" class="notif-filter-btn active">All</button>
                            <button onclick="setNotifFilter('message')" class="notif-filter-btn">Chats</button>
                            <button onclick="setNotifFilter('activity')" class="notif-filter-btn">Activity</button>
                            <button onclick="setNotifFilter('riders')" class="notif-filter-btn">Riders</button>
                        </div>
                        <div id="notif-list" class="notif-list">
                            <div style="padding:20px; text-align:center; color:#444; font-size:0.8rem;">No notifications</div>
                        </div>
                    </div>
                </div>
                ` : '<span style="font-size:0.6rem; color:#444; font-family:\'Orbitron\'">GUEST ACCESS</span>'}
            </div>
        </div>
    `;

    const mobileNavHTML = `
        <div class="mobile-nav">
            ${!isGuestSession ? `<a href="index.html" class="m-nav-btn" id="m-nav-index"><i class="fas fa-home"></i><span>Feed</span></a>` : ''}
            <a href="marketplace.html" class="m-nav-btn" id="m-nav-marketplace"><i class="fas fa-store"></i><span>Shop</span></a>
            ${!isGuestSession ? `
            <a href="garage.html" class="m-nav-btn" id="m-nav-garage"><i class="fas fa-motorcycle"></i><span>Garage</span></a>
            <a href="messenger.html" class="m-nav-btn" id="m-nav-messenger"><i class="fab fa-facebook-messenger"></i><span>Chat</span></a>
            <div class="m-nav-btn" onclick="toggleMobileMenu()"><i class="fas fa-bars"></i><span>More</span></div>
            ` : `<div class="m-nav-btn" onclick="logout(event)"><i class="fas fa-sign-out-alt"></i><span>Exit</span></div>`}
        </div>
        <div id="mobile-menu" class="mobile-menu-overlay hidden">
            <div class="m-menu-header">
                <h2>HUB MENU</h2>
                <i class="fas fa-times" onclick="toggleMobileMenu()" style="font-size:1.5rem; color:#555;"></i>
            </div>
            <div class="m-menu-grid">
                <a href="index.html" class="m-menu-item" style="background:rgba(255,255,255,0.03);"><i class="fas fa-home"></i><span>Return to Hub</span></a>
                <a href="profile.html" class="m-menu-item"><i class="fas fa-user-circle"></i><span>My Profile</span></a>
                <a href="maintenance.html" class="m-menu-item"><i class="fas fa-wrench"></i><span>Maintenance</span></a>
                <a href="events.html" class="m-menu-item"><i class="fas fa-calendar-star"></i><span>Events</span></a>
                <div id="m-admin-link" class="hidden" style="grid-column: span 2;">
                    <a href="admin.html" class="m-menu-item" style="border-color:var(--honda-red); color:var(--honda-red); background:rgba(227,6,19,0.05);">
                        <i class="fas fa-key"></i><span>Admin Panel</span>
                    </a>
                </div>
                <div class="m-menu-item" onclick="toggleMode()"><i class="fas fa-adjust"></i><span id="m-mode-text">Dark/Light</span></div>
                <div class="m-menu-item" onclick="logout(event)" style="color:#666;"><i class="fas fa-sign-out-alt"></i><span>Logout</span></div>
                
                <div class="m-menu-item" onclick="toggleMobileMenu()" style="grid-column: span 2; margin-top: 15px; background:rgba(255,255,255,0.02); border:1px solid #222; color:#555;">
                    <i class="fas fa-times-circle"></i><span>CLOSE MENU</span>
                </div>
            </div>
        </div>
    `;

    if (window.location.pathname.includes('messenger.html')) return;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);

    const mainStage = document.querySelector('.main-stage');
    if (mainStage) {
        mainStage.insertAdjacentHTML('afterbegin', headerHTML);
    }

    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        const modeText = document.getElementById('mode-text');
        if (modeText) modeText.innerText = 'DARK MODE';
    }

    const activeBtn = document.getElementById('nav-' + currentPage.replace('.html', ''));
    if (activeBtn) activeBtn.classList.add('active');

    // Active for mobile nav
    const mActiveBtn = document.getElementById('m-nav-' + currentPage.replace('.html', ''));
    if (mActiveBtn) mActiveBtn.classList.add('active');

    const titleMap = {
        'index.html': 'COMMUNITY FEED', 'marketplace.html': 'MARKETPLACE', 'garage.html': 'RIDER GARAGE',
        'events.html': 'HUB EVENTS', 'maintenance.html': 'MAINTENANCE', 'profile.html': 'EDIT PROFILE', 'admin.html': 'ADMIN PANEL'
    };
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.innerText = titleMap[currentPage] || 'ICPH HUB';
}

function toggleMobileMenu() {
    const m = document.getElementById('mobile-menu');
    if (m) m.classList.toggle('hidden');
}

async function toggleNotifDropdown() {
    const d = document.getElementById('notif-dropdown');
    if (!d) return;
    d.classList.toggle('hidden');
    
    if (!d.classList.contains('hidden') && profile) {
        // Mark all as read in background
        const { data: unreadNotifs } = await sb.from('notifications')
            .select('id')
            .eq('receiver_name', profile.name)
            .eq('is_read', false);
        
        if (unreadNotifs && unreadNotifs.length > 0) {
            const ids = unreadNotifs.map(n => n.id);
            await sb.from('notifications').update({ is_read: true }).in('id', ids);
            // Wait slightly before refreshing the count to ensure the database is updated
            setTimeout(loadNotifications, 1000);
        }
    }
}

function setNotifFilter(f) {
    currentNotifFilter = f;
    document.querySelectorAll('.notif-filter-btn').forEach(btn => {
        if (btn.getAttribute('onclick').includes(`'${f}'`)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    loadNotifications();
}

function toggleMode() {
    const body = document.body;
    const modeText = document.getElementById('mode-text');
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode'); body.classList.add('light-mode');
        modeText.innerText = 'DARK MODE'; localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-mode'); body.classList.add('dark-mode');
        modeText.innerText = 'LIGHT MODE'; localStorage.setItem('theme', 'dark');
    }
}

async function loadNotifications() {
    if (!profile) return;
    let query = sb.from('notifications').select('*').eq('receiver_name', profile.name).order('created_at', { ascending: false });
    
    if (currentNotifFilter === 'message') {
        query = query.eq('type', 'message');
    } else if (currentNotifFilter === 'activity') {
        query = query.in('type', ['post', 'story', 'comment', 'reaction']);
    } else if (currentNotifFilter === 'riders') {
        query = query.in('type', ['follow', 'friend_request', 'friend_accept']);
    }

    const { data } = await query.limit(40);
    const list = document.getElementById('notif-list'), 
          badge = document.getElementById('notif-count'),
          bell = document.querySelector('.notif-bell-cont');
    
    if (!list) return;
    list.innerHTML = '';

    // Accurate unread count calculation for the badge
    const { count: unreadCount } = await sb.from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_name', profile.name)
        .eq('is_read', false);

    if (unreadCount > 0) { 
        badge.innerText = unreadCount > 99 ? '99+' : unreadCount; 
        badge.classList.remove('hidden'); 
        if (bell) bell.classList.add('pulse');
    } else { 
        badge.classList.add('hidden'); 
        if (bell) bell.classList.remove('pulse');
    }

    if (!data || data.length === 0) { list.innerHTML = `<div style="padding:20px; text-align:center; color:#444; font-size:0.8rem;">No ${currentNotifFilter !== 'all' ? currentNotifFilter : ''} notifications</div>`; return; }
    data.forEach(n => {
        const div = document.createElement('div'); div.className = `notif-item ${n.is_read ? '' : 'unread'}`;
        div.onclick = async () => {
            await markNotifAsRead(n.id);
            // Refresh counts immediately before redirecting or opening
            await loadNotifications();

            if (n.type === 'message') window.open(`messenger.html?user=${encodeURIComponent(n.sender_name)}`, '_blank');
            else if (n.type === 'post') window.location.href = `index.html?post=${n.target_id}`;
            else if (n.type === 'story') window.location.href = `index.html?story=${n.target_id}`;
            else if (n.type === 'follow' || n.type === 'friend_request' || n.type === 'friend_accept') window.location.href = `profile.html?id=${n.target_id}`;
        };
        div.innerHTML = `<div style="flex:1;"><b>${n.sender_name}</b> <span>${n.message}</span><small class="notif-time">${new Date(n.created_at).toLocaleString()}</small></div>`;
        list.appendChild(div);
    });
}

// Relationship System
async function getRelationshipStatus(targetId) {
    if (!window.currentUser || !targetId) return { following: false, friendStatus: 'none' };
    
    // Check follow status
    const { data: followData } = await sb.from('follows')
        .select('*')
        .eq('follower_id', window.currentUser.id)
        .eq('following_id', targetId)
        .maybeSingle();

    // Check friendship in both directions
    const { data: friendData } = await sb.from('friendships')
        .select('*')
        .or(`and(sender_id.eq."${window.currentUser.id}",receiver_id.eq."${targetId}"),and(sender_id.eq."${targetId}",receiver_id.eq."${window.currentUser.id}")`)
        .maybeSingle();

    let friendStatus = 'none', friendId = null;
    if (friendData) {
        friendId = friendData.id;
        if (friendData.status === 'accepted') friendStatus = 'accepted';
        else if (friendData.sender_id === window.currentUser.id) friendStatus = 'pending_sent';
        else friendStatus = 'pending_received';
    }
    return { following: !!followData, friendStatus, friendId };
}

async function toggleFollow(targetId, targetName) {
    if (!window.currentUser || !window.profile) return;
    try {
        const { following } = await getRelationshipStatus(targetId);
        if (following) { 
            const { error } = await sb.from('follows').delete().eq('follower_id', window.currentUser.id).eq('following_id', targetId); 
            if (error) throw error;
            return false; 
        } else {
            // follower_name and following_name seem to be missing in the actual database schema
            const { error } = await sb.from('follows').insert({ 
                follower_id: window.currentUser.id, 
                following_id: targetId
            });
            if (error) throw error;
            await createNotification(targetName, window.profile.name, `started following you.`, 'follow', window.currentUser.id); 
            return true;
        }
    } catch (err) {
        console.error("Follow Operation Failed:", err);
        return false;
    }
}

async function handleFriendAction(action, targetId, targetName, requestId = null) {
    if (!window.currentUser || !window.profile) return;
    try {
        if (action === 'add') {
            // sender_name and receiver_name seem to be missing in the actual database schema
            const { error } = await sb.from('friendships').insert({ 
                sender_id: window.currentUser.id, 
                receiver_id: targetId, 
                status: 'pending' 
            });
            if (error) throw error;
            await createNotification(targetName, window.profile.name, `sent you a friend request.`, 'friend_request', window.currentUser.id);
        } else if (action === 'cancel' || action === 'unfriend' || action === 'reject') {
            if (requestId) {
                await sb.from('friendships').delete().eq('id', requestId);
            } else {
                await sb.from('friendships').delete()
                    .or(`and(sender_id.eq."${window.currentUser.id}",receiver_id.eq."${targetId}"),and(sender_id.eq."${targetId}",receiver_id.eq."${window.currentUser.id}")`);
            }
        } else if (action === 'accept') {
            const { error } = await sb.from('friendships').update({ status: 'accepted' }).eq('id', requestId);
            if (error) throw error;
            await createNotification(targetName, window.profile.name, `accepted your friend request.`, 'friend_accept', window.currentUser.id);
        }
    } catch (err) {
        console.error("Friend Action Failed:", err);
    }
}

let currentSearchId = 0;
let searchDebounceTimeout = null;

function toggleMobileSearch() {
    const center = document.querySelector('.header-center');
    const header = document.querySelector('.global-header');
    center.classList.toggle('mobile-active');
    header.classList.toggle('search-active');
    
    // Auto-focus and handle close
    if (center.classList.contains('mobile-active')) {
        document.getElementById('global-rider-search').focus();
        // Add one-time click listener to the pseudo-element close button
        center.onclick = (e) => {
            if (e.offsetX > center.offsetWidth - 40) toggleMobileSearch();
        };
    } else {
        center.onclick = null;
    }
}

async function performGlobalSearch() {
    const query = document.getElementById('global-rider-search').value.trim().toLowerCase();
    const resultsCont = document.getElementById('global-search-results');
    
    // Clear previous debounce
    if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);

    if (!query || query.length < 2) {
        resultsCont.classList.add('hidden');
        resultsCont.innerHTML = '';
        return;
    }

    // Set a small delay so we don't spam Supabase while typing
    searchDebounceTimeout = setTimeout(async () => {
        const searchId = ++currentSearchId;
        
        resultsCont.classList.remove('hidden');
        resultsCont.innerHTML = `<div style="padding:15px; text-align:center; color:#444; font-size:0.7rem;"><i class="fas fa-spinner fa-spin"></i> Searching...</div>`;

        const { data: riders } = await sb.from('riders')
            .select('id, name, avatar_url, rank')
            .ilike('name', `%${query}%`)
            .neq('id', window.currentUser?.id)
            .limit(8);

        // If a newer search has started, ignore these old results
        if (searchId !== currentSearchId) return;

        resultsCont.innerHTML = '';

        if (!riders || riders.length === 0) {
            resultsCont.innerHTML = `<div style="padding:15px; text-align:center; color:#444; font-size:0.8rem;">No riders found</div>`;
            return;
        }

        for (const r of riders) {
            const rel = await getRelationshipStatus(r.id);
            
            // Check again if we are still the latest search after the await
            if (searchId !== currentSearchId) return;

            const div = document.createElement('div');
            div.className = 'global-search-item';
            div.onclick = () => window.location.href = `profile.html?id=${r.id}`;
            
            let friendBtn = '';
            if (rel.friendStatus === 'none') {
                friendBtn = `<button class="search-action-btn add-friend" onclick="event.stopPropagation(); handleFriendAction('add', '${r.id}', '${r.name}'); performGlobalSearch();" title="Add Friend"><i class="fas fa-user-plus"></i></button>`;
            } else if (rel.friendStatus === 'pending_sent') {
                friendBtn = `<button class="search-action-btn pending" title="Request Pending"><i class="fas fa-clock"></i></button>`;
            } else if (rel.friendStatus === 'accepted') {
                friendBtn = `<button class="search-action-btn friends" title="Friends"><i class="fas fa-user-check"></i></button>`;
            }

            let followBtn = '';
            if (rel.following) {
                followBtn = `<button class="search-action-btn following" onclick="event.stopPropagation(); toggleFollow('${r.id}', '${r.name}'); performGlobalSearch();" title="Unfollow"><i class="fas fa-check"></i></button>`;
            } else {
                followBtn = `<button class="search-action-btn follow" onclick="event.stopPropagation(); toggleFollow('${r.id}', '${r.name}'); performGlobalSearch();" title="Follow"><i class="fas fa-plus"></i></button>`;
            }

            div.innerHTML = `
                ${getAvatarHTML(r.name, r.avatar_url, "style='width:35px; height:35px;'")}
                <div style="flex:1; overflow:hidden;">
                    <div style="font-weight:700; font-size:0.85rem; color:white;">${r.name}</div>
                    <div style="font-size:0.6rem; color:#444;">${r.rank || 'Aspirant'}</div>
                </div>
                <div class="search-item-actions">
                    ${friendBtn}
                    ${followBtn}
                </div>
            `;
            resultsCont.appendChild(div);
        }
    }, 300);
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const cont = document.getElementById('global-search-results');
    const input = document.getElementById('global-rider-search');
    if (cont && !cont.contains(e.target) && e.target !== input) {
        cont.classList.add('hidden');
    }
});

async function createNotification(receiver_name, sender_name, message, type = 'post', target_id = null) {
    if (!receiver_name || receiver_name === sender_name) return;
    await sb.from('notifications').insert([{ receiver_name, sender_name, message, type, target_id, is_read: false }]);
}

async function markNotifAsRead(id) { await sb.from('notifications').update({ is_read: true }).eq('id', id); }

async function markTargetNotifsAsRead(targetId) {
    if (!profile) return;
    await sb.from('notifications').update({ is_read: true }).eq('receiver_name', profile.name).eq('target_id', targetId).eq('is_read', false);
}

async function markAllNotifsAsRead() {
    if (!profile) return;
    await sb.from('notifications').update({ is_read: true }).eq('receiver_name', profile.name).eq('is_read', false);
    loadNotifications();
}
window.markAllNotifsAsRead = markAllNotifsAsRead;

async function clearAllNotifications() {
    if (!profile) return;
    if (!confirm("FORCE CLEAR ALL NOTIFICATIONS?")) return;
    
    const { error } = await sb.from('notifications').delete().eq('receiver_name', profile.name);
    
    if (error) {
        console.error("Supabase Delete Error:", error);
        alert("DELETE FAILED: " + error.message + "\n\nTip: Please run the SQL fix in Supabase Editor.");
    } else {
        // Immediate local cleanup for instant feedback
        const list = document.getElementById('notif-list');
        if (list) list.innerHTML = '<div style="padding:20px; text-align:center; color:#444; font-size:0.8rem;">Notifications cleared</div>';
        const badge = document.getElementById('notif-count');
        if (badge) badge.classList.add('hidden');
        const bell = document.querySelector('.notif-bell-cont');
        if (bell) bell.classList.remove('pulse');
        
        loadNotifications(); // Refresh from DB to be sure
    }
}
window.clearAllNotifications = clearAllNotifications;

// Auth & Session
async function checkSession() {
    // PWA: Service Worker Registration
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').catch(e => console.log("SW Error", e));
    }

    const { data: { user }, error: authError } = await sb.auth.getUser();
    const isGuestSession = localStorage.getItem('isGuest') === 'true';

    if (user) {
        currentUser = user;
        // Logic Core: Robust Profile Fetch
        let { data: p, error: pError } = await sb.from('riders').select('*').eq('id', user.id).maybeSingle();
        
        if (!p) {
            // Fallback for missing profile
            const n = user.email.split('@')[0];
            const { data: np, error: insertError } = await sb.from('riders').insert([{ id: user.id, name: n, rank: 'Aspirant' }]).select().single();
            if (insertError) {
                console.error("Profile recovery failed:", insertError);
                return logout();
            }
            p = np;
        }

        if (p.is_banned) { alert("ACCOUNT BANNED!"); return logout(); }
        
        profile = p;
        setupSharedUI(); 
        initRealtime(); 
        updateStatus(); 
        loadOnlineRiders(); 
        loadNotifications();
        subscribeRiderToPush();
        
        const overlay = document.getElementById('auth-overlay');
        if (overlay) overlay.classList.add('hidden');

        setInterval(updateStatus, 30000); 
        setInterval(loadOnlineRiders, 15000); 
        setInterval(loadNotifications, 30000);
    } else if (isGuestSession) {
        isGuest = true;
        const currentPage = window.location.pathname.split("/").pop() || 'index.html';
        const restricted = ['index.html', 'messenger.html', 'garage.html', 'events.html', 'maintenance.html', 'profile.html', 'admin.html'];
        
        if (restricted.includes(currentPage) && currentPage !== 'marketplace.html') {
            window.location.href = 'marketplace.html';
            return;
        }
        
        profile = { name: 'Guest Rider', avatar_url: null, rank: 'Guest' };
        setupSharedUI();
        const overlay = document.getElementById('auth-overlay');
        if (overlay) overlay.classList.add('hidden');
    } else { 
        showAuth(); 
    }
}

// 🛡️ PUSH NOTIFICATION ENGINE (Infra-Shadow Protocol)
async function subscribeRiderToPush() {
    // Only on HTTP/HTTPS and for registered riders
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || isGuest || !profile || !window.location.protocol.startsWith('http')) return;

    try {
        const registration = await navigator.serviceWorker.ready;
        
        // VAPID Public Key from send-push function
        const publicKey = 'BKH7BoOj7ljVD4N-kodE_3R9i8nYNYNnixtEArucSeteDQUNOO6DBswRTpjtW_BeLIbntVjr3hbRbG1171GEmeA';
        
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        // ⚡ SYNC TO SUPABASE (push_subscriptions table)
        const { error } = await sb.from('push_subscriptions').upsert({
            rider_name: profile.name,
            subscription: subscription,
            created_at: new Date().toISOString()
        }, { onConflict: 'rider_name' });

        if (error) throw error;
        console.log("🚀 [PUSH] RIDER SYNCED TO CYBER-TRANSMITTER");
    } catch (err) {
        console.warn("Push subscription failed (Safe to ignore if blocked):", err.message);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
    return outputArray;
}

function guestLogin() {
    localStorage.setItem('isGuest', 'true');
    window.location.href = 'marketplace.html';
}

function setupSharedUI() {
    if (profile && (profile.is_admin || profile.is_super_admin)) {
        const adminSec = document.getElementById('admin-nav-section');
        if (adminSec) adminSec.classList.remove('hidden');
        const mAdminSec = document.getElementById('m-admin-link');
        if (mAdminSec) mAdminSec.classList.remove('hidden');
    }
    const avatarContainer = document.getElementById('u-avatar'); if (avatarContainer) avatarContainer.outerHTML = getAvatarHTML(profile?.name, profile?.avatar_url, "id='u-avatar' style='width:40px; height:40px;'");
    const nameLabel = document.getElementById('u-name'); if (nameLabel) nameLabel.innerText = `${profile?.name?.toUpperCase() || 'GUEST'}`;
    const badgeCont = document.getElementById('u-badge-cont'); if (badgeCont) badgeCont.innerHTML = getBadgeHTML(profile?.rank, profile?.is_super_admin, profile?.name);
}

async function updateStatus() { if (profile && !isGuest) await sb.from('riders').update({ last_seen: new Date().toISOString() }).eq('id', profile.id); }

async function loadOnlineRiders() {
    if (isGuest) return;
    const { data } = await sb.from('riders').select('*').order('last_seen', { ascending: false });
    const list = document.getElementById('online-list'); if (!list) return;
    list.innerHTML = '';
    data.forEach(r => {
        if (r.name === profile.name) return;
        const lastSeen = new Date(r.last_seen), diffMins = Math.floor((new Date() - lastSeen) / 60000);
        let timeStr = diffMins < 5 ? 'Online' : (diffMins < 60 ? `Active ${diffMins}m ago` : (diffMins < 1440 ? `Active ${Math.floor(diffMins / 60)}h ago` : `Active ${Math.floor(diffMins / 1440)}d ago`));
        const isOnline = diffMins < 5, div = document.createElement('div');
        div.className = 'online-rider'; div.onclick = () => startPrivateChat(r.name);
        div.innerHTML = `<div style="position:relative;">${getAvatarHTML(r.name, r.avatar_url, "style='width:35px; height:35px;'")}<div class="status-dot ${isOnline ? 'online' : ''}" style="position:absolute; bottom:0; right:0;"></div></div>
            <div style="flex:1;"><div style="display:flex; align-items:center; justify-content:space-between;"><span style="font-size:0.85rem; font-weight:600; color:#ddd;">${r.name}</span>${getBadgeHTML(r.rank, r.is_super_admin, r.name)}</div><span class="last-seen-text">${timeStr}</span></div>`;
        list.appendChild(div);
    });
}

function startPrivateChat(name) { if (isGuest || name === profile.name) return; window.location.href = `messenger.html?user=${encodeURIComponent(name)}`; }

// ⚡ SONIC-ALERT ENGINE (Motion Spectre Protocol)
const NOTIFY_SOUND = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
NOTIFY_SOUND.volume = 0.5;

function playNotificationSound() {
    NOTIFY_SOUND.currentTime = 0;
    NOTIFY_SOUND.play().catch(() => {}); // Silence errors if browser blocks auto-play
}

function initRealtime() {
    if (isGuest) return;
    sb.channel('global-sync').on('postgres_changes', { event: '*', schema: 'public' }, async (p) => {
        if (p.table === 'riders') loadOnlineRiders();
        if (p.table === 'notifications' && p.new && p.new.receiver_name === profile.name) {
            loadNotifications();
            playNotificationSound(); // Logic Core: Trigger Sonic Alert
            const bell = document.querySelector('.notif-bell-cont');
            if (bell) bell.classList.add('pulse');
        }
        else if (p.table === 'notifications' && p.eventType === 'UPDATE') loadNotifications();
    }).subscribe();
}

async function loginAsSuperAdmin() {
    const code = document.getElementById('admin-code').value;
    if (code === '123') { 
        const { error } = await sb.auth.signInWithPassword({ email: 'admin@panabo.icph', password: 'PanaboRacing2026!' }); 
        if (error) alert(error.message); 
        else { 
            localStorage.removeItem('isGuest'); 
            window.location.href = 'index.html'; // Clean redirect
        } 
    }
    else alert("Invalid Admin Code.");
}

function showAuth() {
    const isGuestSession = localStorage.getItem('isGuest') === 'true';
    if (isGuestSession) return; 

    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        
        // Logic Core: Load remembered email
        const savedEmail = localStorage.getItem('icph_remembered_email');
        if (savedEmail) {
            const emailInput = document.getElementById('auth-email');
            const rememberCheck = document.getElementById('auth-remember');
            if (emailInput) emailInput.value = savedEmail;
            if (rememberCheck) rememberCheck.checked = true;
        }
    }
}

let currentAuthMode = 'login';
function toggleAuthMode(mode) {
    currentAuthMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const mainBtn = document.getElementById('auth-main-btn');
    const toggleLink = document.getElementById('auth-toggle-link');
    const signupExtra = document.getElementById('signup-extra');

    if (mode === 'signup') {
        if (tabLogin) tabLogin.classList.remove('active');
        if (tabSignup) tabSignup.classList.add('active');
        if (mainBtn) mainBtn.innerText = "JOIN THE PACK";
        if (toggleLink) toggleLink.innerHTML = `Already a member? <span onclick="toggleAuthMode('login')" style="color:var(--honda-red); cursor:pointer; text-decoration:underline;">Rider Login</span>`;
        if (signupExtra) signupExtra.classList.remove('hidden');
    } else {
        if (tabSignup) tabSignup.classList.remove('active');
        if (tabLogin) tabLogin.classList.add('active');
        if (mainBtn) mainBtn.innerText = "ICPH ENTER";
        if (toggleLink) toggleLink.innerHTML = `Don't have an account? <span onclick="toggleAuthMode('signup')" style="color:var(--honda-red); cursor:pointer; text-decoration:underline;">Join the Pack</span>`;
        if (signupExtra) signupExtra.classList.add('hidden');
    }
}

async function handleAuth(t) { 
    const emailEl = document.getElementById('auth-email');
    const passEl = document.getElementById('auth-pass');
    const rememberEl = document.getElementById('auth-remember');
    const mainBtn = document.getElementById('auth-main-btn');
    
    if (!emailEl || !passEl) return;
    const e = emailEl.value, p = passEl.value; 
    const remember = rememberEl ? rememberEl.checked : false;

    if (remember) localStorage.setItem('icph_remembered_email', e);
    else localStorage.removeItem('icph_remembered_email');

    // UI Viper: Visual Feedback
    const originalText = mainBtn.innerText;
    mainBtn.disabled = true;
    mainBtn.innerText = "INITIALIZING...";

    try {
        if (t === 'signup') {
            // Default Name: Email Prefix (juan@email.com -> JUAN)
            const n = e.split('@')[0].toUpperCase();

            const { data, error } = await sb.auth.signUp({ email: e, password: p });
            if (error) throw error;
            
            if (data.user) {
                // Logic Core: Immediate Profile Creation
                const { error: pError } = await sb.from('riders').insert([{ 
                    id: data.user.id, 
                    name: n,
                    rank: 'Aspirant' 
                }]);
                if (pError) console.error("Profile creation error:", pError);
            }
            alert("RECRUITMENT SUCCESSFUL! RIDER ENROLLED: " + n);
            window.location.href = 'index.html'; 
        } else {
            const { error } = await sb.auth.signInWithPassword({ email: e, password: p });
            if (error) throw error;
            
            localStorage.removeItem('isGuest');
            window.location.href = 'index.html'; 
        }
    } catch (err) {
        alert(err.message);
        mainBtn.disabled = false;
        mainBtn.innerText = originalText;
    }
}

async function logout(e) { 
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Architect Prime: Keep the remembered email, clear everything else
    const rememberedEmail = localStorage.getItem('icph_remembered_email');
    localStorage.clear(); 
    if (rememberedEmail) localStorage.setItem('icph_remembered_email', rememberedEmail);

    await sb.auth.signOut().catch(err => console.error("SignOut error:", err));

    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
        showAuth();
    } else {
        // Redirect to index where the static portal exists, no parameters needed
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => { if (window.location.pathname.includes('messenger.html')) return; injectSharedUI(); checkSession(); });
