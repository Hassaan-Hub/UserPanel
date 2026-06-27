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

onAuthStateChanged(auth, async (user) => {

    if (user) {

        heading.innerText = "Welcome To Dashboard";

        const querySnapshot = await getDocs(
            collection(db, "users")
        );

        tbody.innerHTML = "";

        querySnapshot.forEach((docItem) => {

            const data = docItem.data();
            const docId = docItem.id;

            const tr = document.createElement("tr");

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

            tr.innerHTML = `
                <td class="border p-2">${data.name}</td>
                <td class="border p-2">${data.email}</td>
                <td class="border p-2">${data.age || "-"}</td>
                <td class="border p-2">${data.city || "-"}</td>
                <td class="border p-2">${data.profession || "-"}</td>
                <td class="border p-2">${timeAgo(data.timestamp) || "-"}</td>
                <td class="border p-2">
                    <button class="editBtn bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                    <button class="deleteBtn bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </td>
            `;

            const editBtn = tr.querySelector(".editBtn");

            editBtn.addEventListener("click", async () => {
                const nameTd = tr.children[0];

                if (editBtn.innerText === "Edit") {
                    const currentName = nameTd.innerText;

                    nameTd.innerHTML = `<input type="text" value="${currentName}" class="border px-2 py-1 rounded w-full" />`;

                    nameTd.querySelector("input").focus();

                    editBtn.innerText = "Save";
                    editBtn.classList.replace("bg-blue-500", "bg-green-500");
                } else {
                    const input = nameTd.querySelector("input");
                    const newName = input.value.trim();

                    if (!newName) return;

                    // 🔥 Firestore update
                    await updateDoc(doc(db, "users", docId), {
                        name: newName
                    });

                    // Table update
                    nameTd.innerText = newName;

                    editBtn.innerText = "Edit";
                    editBtn.classList.replace("bg-green-500", "bg-blue-500");
                }
            });

            tr.querySelector(".deleteBtn").addEventListener("click", async () => {
                await deleteDoc(doc(db, "users", docId));

                const currentUser = auth.currentUser
                if (currentUser && currentUser.uid === docId) {
                    await deleteUser(currentUser)
                }

                tr.remove();
            });

            tbody.appendChild(tr);
        });

    } else {
        window.location.href = "../signin/sign-in.html";
    }
});