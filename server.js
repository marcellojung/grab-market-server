const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/"); //어디다 저장할꺼야?
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});
const port = 8080;

app.use(express.json()); //json 형식의 데이터를 처리할 수 있게 설정하는 코드
app.use(cors()); //브라우저의 CORS 이슈를 막기 위해 사용하는 코드

app.get("/products", async (req, res) => {
  models.Product.findAll({
    order: [["createdAt", "DESC"]], //생겨난 순서대로 내림 차순
    attributes: ["id", "name", "price", "createdAt", "seller", "imageUrl"], //필요한 정보만 뽑아옴
  })
    .then((result) => {
      console.log("PRODUCTS : ", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("에러 발생");
    });
});

app.post("/products", async (req, res) => {
  const body = req.body; // {articles : [{...}]} 클라이언트가 보낸 json body가 출력됩니다.
  const { name, description, price, seller } = body;
  if (!name || !description || !price || !seller) {
    res.send("모든 필드를 입력해 주세요!");
  }
  models.Product.create({
    name,
    description,
    price,
    seller,
  })
    .then((result) => {
      //생성된 레코드 {url: ..., title, ...}를 반환합니다.
      console.log("상품 생성결과", result);
      res.send({ result });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품 업로드에 문제가 발생했습니다.");
    });
});

app.get("/products/:id", (req, res) => {
  const params = req.params; //{id : 값} 형태로 들어옵니다.
  const { id } = params; //ES6 Destructuring
  models.Product.findOne({
    where: {
      id: id,
    },
  })
    .then((result) => {
      console.log("PRODUCT :", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품 조회에 에러가 발생했습니다.");
    });
});

app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  console.log(file);
  res.send({
    imageUrl: file.path,
  });
});

//세팅한 app을 실행시킨다.
app.listen(port, () => {
  console.log("그랩의 쇼핑몰 서버가 돌아가고 있습니다.");
  models.sequelize
    .sync()
    .then(() => {
      console.log("DB 연결 성공!");
    })
    .catch((err) => {
      console.error(err);
      console.log("DB 연결 에러");
      process.exit();
    });
});
