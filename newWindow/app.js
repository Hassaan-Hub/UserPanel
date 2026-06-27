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

                // --- EDIT & SAVE ALL FIELDS ACTION ---
                editBtn.addEventListener("click", async () => {
                    // Tr children indexes map to specific columns
                    const nameTd = tr.children[0];
                    const emailTd = tr.children[1];
                    const ageTd = tr.children[2];
                    const cityTd = tr.children[3];
                    const professionTd = tr.children[4];

                    if (editBtn.innerText === "Edit") {
                        // Purani values store kar rahe hain
                        const currentName = nameTd.innerText;
                        const currentEmail = emailTd.innerText;
                        const currentAge = ageTd.innerText === "-" ? "" : ageTd.innerText;
                        const currentCity = cityTd.innerText === "-" ? "" : cityTd.innerText;
                        const currentProfession = professionTd.innerText === "-" ? "" : professionTd.innerText;

                        // Har field ko input field mein convert kar rahe hain (Sleek CSS styling)
                        const inputClass = "bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-lg px-2 py-1 w-full text-xs outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500";
                        
                        nameTd.innerHTML = `<input type="text" value="${currentName}" class="${inputClass}" />`;
                        emailTd.innerHTML = `<input type="email" value="${currentEmail}" class="${inputClass}" />`;
                        ageTd.innerHTML = `<input type="text" value="${currentAge}" class="${inputClass}" />`;
                        cityTd.innerHTML = `<input type="text" value="${currentCity}" class="${inputClass}" />`;
                        professionTd.innerHTML = `<input type="text" value="${currentProfession}" class="${inputClass}" />`;

                        // First input par focus kar do
                        const nameInput = nameTd.querySelector("input");
                        nameInput.focus();

                        // Agar kisi bhi input par 'Enter' press ho, toh click the save button
                        const allInputs = [nameTd, emailTd, ageTd, cityTd, professionTd].map(td => td.querySelector("input"));
                        allInputs.forEach(input => {
                            input.addEventListener("keydown", (e) => {
                                if (e.key === "Enter") {
                                    editBtn.click();
                                }
                            });
                        });

                        editBtn.innerText = "Save";
                        editBtn.className = "editBtn bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-3.5 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-semibold transition-all duration-200 active:scale-95";
                    } else {
                        // Nayi values collect kar rahe hain
                        const nameInput = nameTd.querySelector("input");
                        const emailInput = emailTd.querySelector("input");
                        const ageInput = ageTd.querySelector("input");
                        const cityInput = cityTd.querySelector("input");
                        const professionInput = professionTd.querySelector("input");

                        const newName = nameInput.value.trim();
                        const newEmail = emailInput.value.trim();
                        const newAge = ageInput.value.trim();
                        const newCity = cityInput.value.trim();
                        const newProfession = professionInput.value.trim();

                        // Form validation: Name aur Email empty nahi hone chahiye
                        if (!newName || !newEmail) {
                            Swal.fire({
                                icon: "warning",
                                title: "Validation Error",
                                text: "Name and Email are required fields!",
                                confirmButtonColor: "#6d28d9"
                            });
                            return;
                        }

                        try {
                            editBtn.innerText = "Saving...";
                            editBtn.disabled = true;

                            // 🔥 Update all fields in Firestore
                            await updateDoc(doc(db, "users", docId), {
                                name: newName,
                                email: newEmail,
                                age: newAge,
                                city: newCity,
                                profession: newProfession
                            });

                            // UI text values ko update kar dein
                            nameTd.innerText = newName;
                            emailTd.innerText = newEmail;
                            ageTd.innerText = newAge || "-";
                            cityTd.innerText = newCity || "-";
                            professionTd.innerText = newProfession || "-";

                            Swal.fire({
                                icon: "success",
                                title: "Updated!",
                                text: "User information updated successfully.",
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
                        confirmButtonColor: '#f43f5e',
                        cancelButtonColor: '#1e1b4b',
                        confirmButtonText: 'Yes, delete it!'
                    });

                    if (result.isConfirmed) {
                        try {
                            await deleteDoc(doc(db, "users", docId));

                            const currentUser = auth.currentUser;
                            if (currentUser && currentUser.uid === docId) {
                                await deleteUser(currentUser);
                                console.log(currentUser);
                                
                            }

                            // Smooth row deletion animation
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