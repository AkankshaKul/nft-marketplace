import { useState } from "react";
import {ethers} from "ethers";
import {Row,Form,Button} from "react-bootstrap"
import {create } from 'ipfs-http-client'
import axios from 'axios'

// const express = require('express');
// const cors = require('cors');

// const app = express();

// const corsOptions = {
//   origin: ['http://localhost:3000'],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE"],
// };
// app.use(cors(corsOptions));


const Create = ({ marketplace, nft}) => {
    // const [image, setImage] = useState('')
    // const [price, setPrice] = useState(null)
    // const [name, setName] = useState('')
    // const [description, setDescription] = useState('')

    // const uploadToIPFS = async (event) =>{
    //     event.preventDefault()
    //     const file = event.target.files[0]
    //     const reader = new window.FileReader();
    //     reader.readAsArrayBuffer(file);
    //     reader.onloadend = () => {
    //     console.log("Buffer data: ", Buffer(reader.result));
    //     }
    //     if(typeof file !== 'undefined'){
    //         try{
    //             const result = await client.add(file)
    //             console.log(result)
    //             setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
    //         }
    //         catch(error){
    //             console.log("ipfs image upload error: ", error)
    //         }
    //     }
    // }
    const [fileImg, setFile] = useState(null);
    const [name, setName] = useState("")
    const [desc, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const sendJSONtoIPFS = async (ImgHash) => {

        try {
          const resJSON = await axios({
            method: "post",
            url: "https://aquamarine-active-flea-952.mypinata.cloud/pinning/pinJsonToIPFS",
            data: {
              "name": name,
              "description": desc,
              "image": ImgHash
            },
            headers: {
              'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
              'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_API_KEY,
              "Content-Type": "multipart/form-data",
              Accept: "text/plain",
               
            },
          });
    
          const tokenURI = `https://aquamarine-active-flea-952.mypinata.cloud/ipfs/${resJSON.data.IpfsHash}`;
          console.log("Token URI", tokenURI);
          mintThenList(tokenURI)
        } catch (error) {
          console.log("JSON to IPFS: ")
          console.log(error);
        }
      }
    
      const sendFileToIPFS = async (e) => {
    
        e.preventDefault();
    
        console.log(e);
    
    
        if (fileImg) {
          try {
            const formData = new FormData();
            formData.append("file", fileImg);
    
            const resFile = await axios({
              method: "post",
              url: "https://aquamarine-active-flea-952.mypinata.cloud/pinning/pinFileToIPFS",
              data: formData,
              headers: {
                'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_API_KEY,
                "Content-Type": "multipart/form-data",
                // "Content-Type": `multipart/form-data: boundary=${formData.getBoundary()}`,
                 Accept: "text/plain",

              },
            });
    
            const ImgHash = `https://aquamarine-active-flea-952.mypinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            console.log(ImgHash);
            sendJSONtoIPFS(ImgHash)
    
    
          } catch (error) {
            console.log("File to IPFS: ")
            console.log(error)
          }
        }
      }

    // const createNFT = async () => {
    //     if(!image || !price || !name || !description) return
    //     try{
    //         const result = await client.add(JSON.stringify({image, name, description}))
    //         mintThenList(result)
    //     }
    //     catch(error){
    //         console.log("ipfs uri upload error in createNFT:", error)
    //     }
    // }

    const mintThenList = async (uri) => {
        // const uri = `https://ipfs.infura.io/ipfs/${result.path}`
        //mint nft
        await (await nft.mint(uri)).wait()
        // get tokenid of new nft 
        const id = await nft.tokenCount()
        // approve marketplace to spend nft
        await (await nft.setApprovalForAll(marketplace.address , true)).wait()
        // add nft to marketplace
        const listingPrice = ethers.utils.parseEther(price.toString())
        await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()
    }


    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{maxWidth: '1000px'}}>
                    <div className="content mx-auto">
                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                size="lg"
                                name="file"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            <Form.Control
                                onChange={(e) => setName(e.target.value)}
                                size="lg"
                                type="text"
                                placeholder="Name"
                            />
                            <Form.Control
                                onChange={(e) => setDescription(e.target.value)}
                                size="lg"
                                as="textarea"
                                placeholder="Description"
                            />
                            <Form.Control
                                onChange={(e) => setPrice(e.target.value)}
                                size="lg"
                                type="number"
                                placeholder="Price in ETH"
                            />
                            <div className="d-grid px-0">
                                <Button onClick={sendFileToIPFS} variant="primary" size="lg">
                                    Create & List NFT!
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    )
}
export default Create



/** 
 * 
-- gateway URL - https://aquamarine-active-flea-952.mypinata.cloud

API Key: 22568039e7d65e35552b
 API Secret: dd1e58eac69860df581aae8856c03420c9d7c5bb53b9bf97d8121b2831ac552a
 JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3ZThjNTk3MS00ZWE0LTQ3NjQtODRlMy0xNzYzY2E3MDQ1NGEiLCJlbWFpbCI6ImFrYW5rc2hhazIzMTBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIyNTY4MDM5ZTdkNjVlMzU1NTJiIiwic2NvcGVkS2V5U2VjcmV0IjoiZGQxZTU4ZWFjNjk4NjBkZjU4MWFhZTg4NTZjMDM0MjBjOWQ3YzViYjUzYjliZjk3ZDgxMjFiMjgzMWFjNTUyYSIsImlhdCI6MTcwNzQxMjAwNX0.Mr9-GnuWDoEfHW-__hMk6BudIcBIqhuDZ8StHMJRrB8
 */