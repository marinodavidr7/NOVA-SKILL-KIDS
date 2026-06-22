const mysql = require('mysql2/promise');

const childrenNames = [
  ['Mateo', 'Garcia Perez'], ['Valentina', 'Martinez Lopez'], ['Santiago', 'Rodriguez Gomez'],
  ['Isabella', 'Hernandez Diaz'], ['Matias', 'Gonzalez Sanchez'], ['Camila', 'Perez Romero'],
  ['Leonardo', 'Gomez Alvarez'], ['Mariana', 'Diaz Ruiz'], ['Emiliano', 'Alvarez Torres'],
  ['Victoria', 'Torres Flores'], ['Diego', 'Ruiz Jimenez'], ['Luciana', 'Flores Moreno'],
  ['Sebastian', 'Jimenez Acosta'], ['Daniela', 'Moreno Ortiz'], ['Nicolas', 'Ortiz Silva'],
  ['Valeria', 'Silva Rojas'], ['Samuel', 'Rojas Cruz'], ['Renata', 'Cruz Vargas'],
  ['Alejandro', 'Vargas Mendez'], ['Julieta', 'Mendez Reyes']
];

const parentNames = [
  ['Carlos', 'Garcia'], ['Ana', 'Martinez'], ['Luis', 'Rodriguez'],
  ['Maria', 'Hernandez'], ['Jose', 'Gonzalez'], ['Laura', 'Perez'],
  ['David', 'Gomez'], ['Carmen', 'Diaz'], ['Jorge', 'Alvarez'],
  ['Sofia', 'Torres'], ['Miguel', 'Ruiz'], ['Elena', 'Flores'],
  ['Pedro', 'Jimenez'], ['Lucia', 'Moreno']
];

const teacherNames = [
  ['Rosa', 'Mejia'], ['Blanca', 'Castro'], ['Carmen', 'Nuñez']
];

function getRandomDate(startYear, endYear) {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1; // Simplify days
  return new Date(year, month, day).toISOString().split('T')[0];
}

async function seed() {
  const conn = await mysql.createConnection('mysql://root:root@localhost:3306/estancia');

  try {
    console.log('Inserting teachers...');
    const teacherIds = [];
    for (const [firstName, lastName] of teacherNames) {
      const [res] = await conn.execute(
        `INSERT INTO staff (firstName, lastName, role, status, salary, dni, email, phone) 
         VALUES (?, ?, 'Teacher', 'active', 20000, ?, ?, ?)`,
        [firstName, lastName, `000-${Math.floor(Math.random()*1000000)}-${Math.floor(Math.random()*10)}`, `${firstName.toLowerCase()}@example.com`, `809-555-${Math.floor(Math.random()*10000)}`]
      );
      teacherIds.push(res.insertId);
    }

    console.log('Inserting parents...');
    const parentIds = [];
    for (const [firstName, lastName] of parentNames) {
       const [res] = await conn.execute(
         `INSERT INTO parents (firstName, lastName, cedula, email, phone)
          VALUES (?, ?, ?, ?, ?)`,
         [firstName, lastName, `000-${Math.floor(Math.random()*1000000)}-${Math.floor(Math.random()*10)}`, `${firstName.toLowerCase()}${lastName.toLowerCase()}@example.com`, `809-555-${Math.floor(Math.random()*10000)}`]
       );
       parentIds.push(res.insertId);
    }

    console.log('Inserting children and relations...');
    let childIndex = 0;
    // 6 parents get 2 children
    for(let i=0; i<6; i++) {
        const parentId = parentIds[i];
        for(let j=0; j<2; j++) {
             const [firstName, lastName] = childrenNames[childIndex];
             // ages 2 to 9 -> born between 2017 and 2024
             const birthDate = getRandomDate(2017, 2024);
             const [res] = await conn.execute(
                 `INSERT INTO children (firstName, lastName, dateOfBirth, status) VALUES (?, ?, ?, 'active')`,
                 [firstName, lastName, birthDate]
             );
             const childId = res.insertId;
             
             await conn.execute(
                 `INSERT INTO child_parents (child_id, parent_id, relationship, isEmergencyContact, isAuthorizedToPickup) VALUES (?, ?, 'Padre/Madre', true, true)`,
                 [childId, parentId]
             );
             childIndex++;
        }
    }

    // Remaining parents get 1 child
    for(let i=6; i<parentIds.length; i++) {
        if(childIndex >= childrenNames.length) break;
        const parentId = parentIds[i];
        const [firstName, lastName] = childrenNames[childIndex];
        const birthDate = getRandomDate(2017, 2024);
        const [res] = await conn.execute(
            `INSERT INTO children (firstName, lastName, dateOfBirth, status) VALUES (?, ?, ?, 'active')`,
            [firstName, lastName, birthDate]
        );
        const childId = res.insertId;
        
        await conn.execute(
            `INSERT INTO child_parents (child_id, parent_id, relationship, isEmergencyContact, isAuthorizedToPickup) VALUES (?, ?, 'Padre/Madre', true, true)`,
            [childId, parentId]
        );
        childIndex++;
    }

    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    conn.end();
  }
}

seed();
