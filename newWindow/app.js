import {
    getAuth,
    onAuthStateChanged,
    db,
    collection,
    getDocs,
    deleteDoc,
    doc,
    deleteUser,
    updateDoc
} from "../firebaseCode.js";

const auth = getAuth();
const tbody = document.getElementById("userTableBody");
const heading = document.getElementById("wel");

// Time Ago Helper function
function timeAgo(timestamp) {
    const now = new Date();
    const date = timestamp?.toDate();
    if (!date) return "-";

    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

onAuthStateChanged(auth, async (user) => {

    if (user) {
        heading.innerText = "Welcome To Dashboard";

        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            tbody.innerHTML = "";

            querySnapshot.forEach((docItem) => {
                const data = docItem.data();
                const docId = docItem.id;
                const tr = document.createElement("tr");

                // Clean cells design matching the glassmorphism theme
                tr.innerHTML = `
                    <td>${data.name}</td>
                    <td>${data.email}</td>
                    <td>${data.age || "-"}</td>
                    <td>${data.city || "-"}</td>
                    <td>${data.profession || "-"}</td>
                    <td>${timeAgo(data.timestamp) || "-"}</td>
                    <td>
                        <div class="flex items-center gap-2">
                            <button class="editBtn bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white px-3.5 py-1.5 rounded-lg border border-violet-500/20 text-xs font-semibold transition-all duration-200 active:scale-95">Edit</button>
                            <button class="deleteBtn bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-3.5 py-1.5 rounded-lg border border-rose-500/20 text-xs font-semibold transition-all duration-200 active:scale-95">Delete</button>
                        </div>
                    </td>
                `;

                const editBtn = tr.querySelector(".editBtn");
                const deleteBtn = tr.querySelector(".deleteBtn");

                // --- EDIT & SAVE ACTION ---
                editBtn.addEventListener("click", async () => {
                    const nameTd = tr.children[0];

                    if (editBtn.innerText === "Edit") {
                        const currentName = nameTd.innerText;

                        // Modern dark input field inside table cell
                        nameTd.innerHTML = `
                            <input type="text" value="${currentName}" 
                                class="bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-lg px-3 py-1.5 w-full text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                        `;

                        const nameInput = nameTd.querySelector("input");
                        nameInput.focus();

                        // Auto save when pressing 'Enter' key
                        nameInput.addEventListener("keydown", (e) => {
                            if (e.key === "Enter") {
                                editBtn.click();
                            }
                        });

                        editBtn.innerText = "Save";
                        // Green/Emerald theme for Save State
                        editBtn.className = "editBtn bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-3.5 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-semibold transition-all duration-200 active:scale-95";
                    } else {
                        const nameInput = nameTd.querySelector("input");
                        const newName = nameInput.value.trim();

                        if (!newName) {
                            Swal.fire({
                                icon: "warning",
                                title: "Validation Error",
                                text: "Name field cannot be left blank!",
                                confirmButtonColor: "#6d28d9"
                            });
                            return;
                        }

                        try {
                            editBtn.innerText = "Saving...";
                            editBtn.disabled = true;

                            // Update Firestore database document
                            await updateDoc(doc(db, "users", docId), {
                                name: newName
                            });

                            // Update UI
                            nameTd.innerText = newName;

                            Swal.fire({
                                icon: "success",
                                title: "Updated!",
                                text: "User name has been updated.",
                                confirmButtonColor: "#6d28d9",
                                timer: 1200,
                                showConfirmButton: false
                            });
                        } catch (err) {
                            console.error("Firestore update failed: ", err);
                            Swal.fire({
                                icon: "error",
                                title: "Update Failed",
                                text: "Unable to save modifications.",
                                confirmButtonColor: "#dc2626"
                            });
                        } finally {
                            editBtn.innerText = "Edit";
                            editBtn.disabled = false;
                            // Revert style back to original edit violet theme
                            editBtn.className = "editBtn bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white px-3.5 py-1.5 rounded-lg border border-violet-500/20 text-xs font-semibold transition-all duration-200 active:scale-95";
                        }
                    }
                });

                // --- CONFIRMED DELETE ACTION ---
                deleteBtn.addEventListener("click", async () => {
                    const result = await Swal.fire({
                        title: 'Are you sure?',
                        text: "This user record will be permanently deleted!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#f43f5e', // rose-500
                        cancelButtonColor: '#1e1b4b', // deep indigo
                        confirmButtonText: 'Yes, delete it!'
                    });

                    if (result.isConfirmed) {
                        try {
                            // Delete from Firestore
                            await deleteDoc(doc(db, "users", docId));

                            const currentUser = auth.currentUser;
                            if (currentUser && currentUser.uid === docId) {
                                await deleteUser(currentUser);
                            }

                            // Smooth row deletion animation (fade out effect)
                            tr.style.opacity = '0';
                            tr.style.transition = 'opacity 0.3s ease';
                            setTimeout(() => tr.remove(), 300);

                            Swal.fire({
                                icon: "success",
                                title: "Deleted!",
                                text: "The user has been deleted.",
                                confirmButtonColor: "#6d28d9",
                                timer: 1200,
                                showConfirmButton: false
                            });
                        } catch (err) {
                            console.error("Deletion failed: ", err);
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Could not complete deletion request.",
                                confirmButtonColor: "#dc2626"
                            });
                        }
                    }
                });

                tbody.appendChild(tr);
            });
        } catch (dbError) {
            console.error("Error fetching database documents: ", dbError);
        }

    } else {
        window.location.href = "../signin/sign-in.html";
    }
});