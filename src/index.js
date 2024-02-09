// -------- CONFIG BÁSICA EXPRESS ----------
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3333, () => console.log("Servidor inicializado com sucesso"));

//------- VERIFICA SE API ESTÁ FUNCIONANDO -------
app.get("/", (request, response) => {
  return response.json("OK");
});

let idMessage = 1;
let idUser = 1;
const users = [];
const messages = [];

//--------- CRIAR NOVO USUÁRIO -----------
app.post("/user", async (request, response) => {
  const data = request.body;
  let email = data.email;
  let password = data.password;
  const hashPassword = await bcrypt.hash(password, 10);
  const checkEmail = users.findIndex((user) => user.email === email);

  if (checkEmail == -1) {
    users.push({
      id: idUser,
      name: data.name,
      email: data.email,
      password: hashPassword,
    });

    idUser++;

    response
      .status(201)
      .json({ sucess: true, msg: "Usuário registrado com sucesso" });
  } else {
    response
      .status(409)
      .json({ success: false, msg: "Esse endereço de e-mail já existe" });
  }
});

//------- LER USUÁRIO ---------
app.get("/user", (request, response) => {
  return response.status(200).json({
    success: true,
    msg: "Lista de usuário retornado com sucesso.",
    data: users,
  });
});

// --------- CRIAR RECADO -------------
app.post("/message", (request, response) => {
  const data = request.body;

  const email = data.email;
  const title = data.title;
  const description = data.description;

  const userEmail = users.filter((user) => user.email === email);

  if (!userEmail) {
    response.status(400).json({ msg: "E-mail não encontrado" });
  }

  const message = {
    email,
    idMessage,
    title,
    description,
  };

  idMessage++;
  messages.push(message);

  response
    .status(201)
    .json({ success: true, msg: "Recado cadastrado com sucesso" });
});

// -------- LISTAR RECADOS -----------
app.get("/message", (request, response) => {
  return response.status(200).json({
    success: true,
    msg: "Lista de recados retornado com sucesso.",
    data: messages,
  });
});

// --------- ATUALIZAR RECADOS -----------
app.put("/message/:msgAtual", (request, response) => {
  const data = request.body;
  const messageId = Number(request.params.msgAtual);
  const updateTitle = data.title;
  const updateDescription = data.description;

  const messageIndex = messages.findIndex(
    (message) => message.idMessage === messageId
  );
   
  if (messageIndex !== -1) {
    const message = messages[messageIndex];

    message.title = updateTitle;
    message.description = updateDescription;
    const update = {
      updateTitle,
      updateDescription,
    };

    response
      .status(200)
      .json({ msg: "Atualizações realizada com sucesso", data: update });
  } else {
    return response.status(404).json({ msg: "Recado não encontrado" });
  }
});

// -------- DELETAR MENSAGEM ----------
app.delete("/message/:messageId", (request, response) => {
  const messageId = Number(request.params.messageId);
  const indexMessage = messages.findIndex(
    (message) => message.idMessage === messageId
  );

  if (indexMessage !== -1) {
    messages.splice(indexMessage, 1);
    response.status(200).json({ msg: "Mensagem apagada com sucesso!" });
  } else {
    return response.status(404).json({ msg: "Mensagem nao encontrada!" });
  }
});

// ------- LOGIN ---------
app.post("/login", async (request, response) => {
  const { email, password } = request.body;
  const user = users.find((user) => user.email === email);
  const comparePassword = await bcrypt.compare(password, user.password);

  if (comparePassword) {
    response.status(200).json({ success: true, message: "Login bem sucedido" });
  } else {
    return response
      .status(400)
      .json({ success: false, message: "Senha inválida" });
  }
});
